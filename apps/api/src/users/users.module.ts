import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserSubscriber } from './subscribers/user.subscriber';
import { UsersController } from './users.controller';

// NotificationModule is @Global() — registered in AppModule, so no import needed here.
// Importing it here would create a circular dependency:
// UsersModule → NotificationModule → SmsModule → (was) UsersModule
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserSubscriber],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
