import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDataDeletionRequestDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    reason?: string;
}
