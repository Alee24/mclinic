import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Speciality } from './entities/speciality.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Speciality])],
    exports: [TypeOrmModule],
})
export class SpecialitiesModule { }
