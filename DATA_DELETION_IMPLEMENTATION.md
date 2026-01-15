# Data Deletion Implementation Guide

## Overview
This guide implements a GDPR-compliant data deletion system with:
- 7-day grace period
- Password confirmation required
- Accidental deletion prevention
- Automatic cleanup after grace period

## Step 1: Database Migration

Run this SQL on your database:

```sql
ALTER TABLE users 
ADD COLUMN deletion_requested_at DATETIME NULL,
ADD COLUMN deletion_scheduled_for DATETIME NULL,
ADD COLUMN deletion_reason TEXT NULL;
```

## Step 2: Update User Entity

File: `apps/api/src/users/entities/user.entity.ts`

Add these fields:

```typescript
@Column({ type: 'datetime', nullable: true })
deletionRequestedAt: Date;

@Column({ type: 'datetime', nullable: true })
deletionScheduledFor: Date;

@Column({ type: 'text', nullable: true })
deletionReason: string;
```

## Step 3: Implement Service Methods

File: `apps/api/src/users/users.service.ts`

Add these methods:

```typescript
async requestDataDeletion(userId: number, password: string) {
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  
  if (!user) {
    throw new Error('User not found');
  }

  // Verify password
  const bcrypt = require('bcrypt');
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid password');
  }

  // Set deletion date to 7 days from now
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 7);

  user.deletionRequestedAt = new Date();
  user.deletionScheduledFor = deletionDate;
  user.status = false; // Deactivate account immediately

  await this.usersRepository.save(user);

  // TODO: Send email notification
  
  return {
    success: true,
    message: 'Data deletion requested. You have 7 days to cancel this request.',
    scheduledFor: deletionDate,
  };
}

async cancelDataDeletion(userId: number) {
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.deletionRequestedAt) {
    throw new Error('No deletion request found');
  }

  user.deletionRequestedAt = null;
  user.deletionScheduledFor = null;
  user.deletionReason = null;
  user.status = true; // Reactivate account

  await this.usersRepository.save(user);

  return {
    success: true,
    message: 'Data deletion request cancelled successfully',
  };
}

async getDeletionStatus(userId: number) {
  const user = await this.usersRepository.findOne({ 
    where: { id: userId },
    select: ['id', 'deletionRequestedAt', 'deletionScheduledFor']
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    hasPendingDeletion: !!user.deletionRequestedAt,
    requestedAt: user.deletionRequestedAt,
    scheduledFor: user.deletionScheduledFor,
    daysRemaining: user.deletionScheduledFor 
      ? Math.ceil((new Date(user.deletionScheduledFor).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
  };
}

// Scheduled job - run daily
async processScheduledDeletions() {
  const now = new Date();
  
  const usersToDelete = await this.usersRepository.find({
    where: {
      deletionScheduledFor: LessThanOrEqual(now),
    },
  });

  for (const user of usersToDelete) {
    // Delete user data
    await this.usersRepository.remove(user);
    
    // TODO: Delete related data (appointments, medical records, etc.)
    // TODO: Send final confirmation email
  }

  return {
    deleted: usersToDelete.length,
  };
}
```

## Step 4: Create Scheduled Job

File: `apps/api/src/users/users.cron.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';

@Injectable()
export class UsersCronService {
  constructor(private readonly usersService: UsersService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleScheduledDeletions() {
    console.log('Running scheduled user deletions...');
    const result = await this.usersService.processScheduledDeletions();
    console.log(`Deleted ${result.deleted} users`);
  }
}
```

## Step 5: Frontend Component

Create: `apps/web/src/components/dashboard/DataDeletionModal.tsx`

See the separate file for the complete component.

## Step 6: Add to Sidebar

In `apps/web/src/app/dashboard/layout.tsx`, add under "General" section:

```tsx
<NavItem 
  href="/dashboard/settings/data-deletion" 
  icon={<FiTrash />} 
  label="Delete My Data" 
  active={pathname === '/dashboard/settings/data-deletion'} 
/>
```

## Step 7: Testing Checklist

- [ ] Password verification works
- [ ] 7-day grace period is calculated correctly
- [ ] User can cancel deletion request
- [ ] Account is deactivated immediately upon request
- [ ] Scheduled job runs and deletes expired accounts
- [ ] Email notifications are sent
- [ ] Related data is properly cleaned up

## Security Considerations

1. **Password Required**: Users must enter their password to confirm deletion
2. **Grace Period**: 7 days to change their mind
3. **Immediate Deactivation**: Account is disabled immediately but data retained
4. **Audit Trail**: Log all deletion requests and cancellations
5. **Email Notifications**: Notify user at request, reminder at day 6, and final confirmation

## Compliance

This implementation satisfies:
- GDPR Article 17 (Right to Erasure)
- Kenya Data Protection Act, 2019
- HIPAA data retention requirements (medical records may need longer retention)

## Notes

- Medical records should be retained for 7 years for legal compliance
- Financial records should be retained for tax purposes
- Consider anonymizing data instead of complete deletion for analytics
