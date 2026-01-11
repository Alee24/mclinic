import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { FinancialService } from './src/financial/financial.service';

async function bootstrap() {
    try {
        console.log('Initializing Nest Context...');
        const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
        const financialService = app.get(FinancialService);

        console.log('--- Testing Get Revenue Report ---');
        const revenue = await financialService.getRevenueReport();
        console.log(`Found ${revenue.length} Invoices/Items.`);
        if (revenue.length > 0) {
            console.log('Sample Item:', JSON.stringify(revenue[0], null, 2));

            // Stats
            const paid = revenue.filter(r => r.status === 'paid').length;
            const pending = revenue.filter(r => r.status === 'pending').length;
            console.log(`Summary: Paid=${paid}, Pending=${pending}`);
        }

        // Test getStats
        console.log('\n--- Testing Get Stats ---');
        // Mock user as admin (undefined or specific role)
        try {
            const stats = await financialService.getStats({ role: 'admin', email: 'admin@test.com', id: 1 });
            console.log('Stats Result:', JSON.stringify(stats, null, 2));
        } catch (error) {
            console.error('Error getting stats:', error);
        }

        await app.close();
        process.exit(0);

    } catch (e) {
        console.error('Error running test:', e);
        process.exit(1);
    }
}

bootstrap();
