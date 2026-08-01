import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserSubscriber } from './subscribers/user.subscriber';
import { UsersController } from './users.controller';
import { NotificationModule } from '../notification/notification.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), NotificationModule],
  providers: [UsersService, UserSubscriber],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule { }
