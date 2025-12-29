import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsService } from '../doctors.service';
import { Response } from 'express';
import * as QRCode from 'qrcode';

@Controller('doctors')
export class IdCardController {
    constructor(private readonly doctorsService: DoctorsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/id-card')
    async generateIdCard(@Param('id') id: string, @Res() res: Response) {
        console.log(`Generating ID card for doctor ${id}`);
        try {
            const doctor = await this.doctorsService.findOne(+id);
            console.log('Doctor found:', doctor ? doctor.id : 'null');

            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            if (doctor.approvalStatus !== 'approved') {
                return res.status(403).json({ message: 'Only approved doctors can generate ID cards' });
            }

            // Generate QR code with verification URL
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-doctor/${doctor.id}`;
            const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

            // Return ID card data
            const idCardData = {
                doctor: {
                    id: doctor.id,
                    name: `Dr. ${doctor.fname} ${doctor.lname}`,
                    speciality: doctor.speciality || 'General Practice',
                    drType: doctor.dr_type,
                    licenseNumber: doctor.licenceNo || doctor.reg_code,
                    licenseExpiry: doctor.licenseExpiryDate,
                    email: doctor.email,
                    mobile: doctor.mobile,
                    profileImage: doctor.profile_image,
                },
                qrCode: qrCodeDataUrl,
                issuedDate: new Date().toISOString(),
                verificationUrl,
            };

            return res.json(idCardData);
        }

    @Get('verify/:id')
        async verifyDoctor(@Param('id') id: string) {
            const doctor = await this.doctorsService.findOne(+id);

            if (!doctor) {
                return { valid: false, message: 'Doctor not found' };
            }

            const isValid =
                doctor.approvalStatus === 'approved' &&
                doctor.licenseStatus === 'valid' &&
                doctor.status === 1;

            return {
                valid: isValid,
                doctor: isValid ? {
                    name: `Dr. ${doctor.fname} ${doctor.lname}`,
                    speciality: doctor.speciality,
                    licenseNumber: doctor.licenceNo || doctor.reg_code,
                    licenseExpiry: doctor.licenseExpiryDate,
                } : null,
                message: isValid ? 'Valid doctor credentials' : 'Invalid or inactive doctor',
            };
        }
    }
