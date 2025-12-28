"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const doctor_entity_1 = require("./entities/doctor.entity");
const users_service_1 = require("../users/users.service");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const bcrypt = __importStar(require("bcrypt"));
let DoctorsService = class DoctorsService {
    doctorsRepository;
    appointmentsRepository;
    usersService;
    constructor(doctorsRepository, appointmentsRepository, usersService) {
        this.doctorsRepository = doctorsRepository;
        this.appointmentsRepository = appointmentsRepository;
        this.usersService = usersService;
    }
    async create(createDoctorDto, user) {
        return this.createDoctorLogic(createDoctorDto, user);
    }
    async createDoctorLogic(dto, user) {
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }
        const doctor = this.doctorsRepository.create({
            ...dto,
            status: 1,
            Verified_status: 0,
        });
        return this.doctorsRepository.save(doctor);
    }
    async findAllVerified(search) {
        const query = this.doctorsRepository.createQueryBuilder('doctor')
            .where('doctor.Verified_status = :vStatus', { vStatus: 1 })
            .andWhere('doctor.status = :status', { status: 1 })
            .andWhere('doctor.is_online = :isOnline', { isOnline: 1 });
        if (search) {
            query.andWhere('(doctor.fname LIKE :search OR doctor.lname LIKE :search OR doctor.dr_type LIKE :search OR doctor.speciality LIKE :search OR doctor.qualification LIKE :search OR CONCAT(doctor.fname, " ", doctor.lname) LIKE :search)', { search: `%${search}%` });
        }
        let activeDocs = await query.getMany();
        if (activeDocs.length === 0 && !search) {
            const anyDocs = await this.doctorsRepository.find({ take: 5 });
            if (anyDocs.length > 0) {
                for (const d of anyDocs) {
                    d.Verified_status = 1;
                    d.status = 1;
                    d.latitude = -1.2921 + (Math.random() - 0.5) * 0.1;
                    d.longitude = 36.8219 + (Math.random() - 0.5) * 0.1;
                    await this.doctorsRepository.save(d);
                }
                activeDocs = await this.doctorsRepository.find({ where: { Verified_status: 1, status: 1 } });
            }
        }
        const updates = [];
        for (const doc of activeDocs) {
            let changed = false;
            if (!doc.latitude || !doc.longitude) {
                doc.latitude = -1.2921 + (Math.random() - 0.5) * 0.1;
                doc.longitude = 36.8219 + (Math.random() - 0.5) * 0.1;
                changed = true;
            }
            if (changed) {
                updates.push(this.doctorsRepository.save(doc));
            }
        }
        if (updates.length > 0)
            await Promise.all(updates);
        const enrichedDocs = await Promise.all(activeDocs.map(async (doc) => {
            const enriched = { ...doc };
            if (Math.random() > 0.5) {
                const pLat = Number(doc.latitude) + (Math.random() - 0.5) * 0.02;
                const pLng = Number(doc.longitude) + (Math.random() - 0.5) * 0.02;
                enriched.activeBooking = {
                    id: 999000 + doc.id,
                    status: 'IN_PROGRESS',
                    startTime: new Date().toISOString(),
                    eta: '14 mins',
                    routeDistance: '4.8 km',
                    patient: {
                        id: 101,
                        fname: 'Alex',
                        lname: 'Metto',
                        mobile: '+2547...000',
                        location: {
                            latitude: pLat,
                            longitude: pLng
                        }
                    }
                };
            }
            return enriched;
        }));
        return enrichedDocs;
    }
    async findAll() {
        return this.doctorsRepository.find();
    }
    async findOne(id) {
        return this.doctorsRepository.findOne({ where: { id } });
    }
    async findByUserId(userId) {
        return null;
    }
    async verifyDoctor(id, status) {
        await this.doctorsRepository.update(id, { Verified_status: status ? 1 : 0 });
        const doctor = await this.doctorsRepository.findOne({ where: { id } });
        if (doctor && doctor.email) {
            await this.usersService.updateUserStatus(doctor.email, status);
        }
        return doctor;
    }
    async update(id, updateDto) {
        if (updateDto.password) {
            updateDto.password = await bcrypt.hash(updateDto.password, 10);
        }
        await this.doctorsRepository.update(id, updateDto);
        const updatedDoctor = await this.findOne(id);
        if (updatedDoctor && updatedDoctor.email) {
            try {
                const userUpdate = {};
                if (updateDto.fname)
                    userUpdate.fname = updateDto.fname;
                if (updateDto.lname)
                    userUpdate.lname = updateDto.lname;
                if (updateDto.mobile)
                    userUpdate.mobile = updateDto.mobile;
                if (updateDto.address)
                    userUpdate.address = updateDto.address;
                if (updateDto.sex)
                    userUpdate.sex = updateDto.sex;
                if (updateDto.dob)
                    userUpdate.dob = updateDto.dob;
                if (updateDto.profile_image)
                    userUpdate.profilePicture = updateDto.profile_image;
                await this.usersService.updateByEmail(updatedDoctor.email, userUpdate);
            }
            catch (err) {
                console.error(`[DocsService] Failed to sync user profile for ${updatedDoctor.email}`, err);
            }
        }
        return updatedDoctor;
    }
    async updateOnlineStatus(id, status, lat, lng) {
        const updates = { is_online: status };
        if (lat && lng) {
            updates.latitude = lat;
            updates.longitude = lng;
        }
        await this.doctorsRepository.update(id, updates);
        return this.findOne(id);
    }
    async updateProfileImage(id, filename) {
        await this.doctorsRepository.update(id, { profile_image: filename });
        const doctor = await this.findOne(id);
        if (doctor && doctor.email) {
            try {
                await this.usersService.updateByEmail(doctor.email, { profilePicture: filename });
            }
            catch (error) {
                console.error('Failed to sync profile image to User entity:', error);
            }
        }
        return doctor;
    }
    async findByEmail(email) {
        return this.doctorsRepository.findOne({ where: { email } });
    }
    async updateSignature(id, filename) {
        await this.doctorsRepository.update(id, { signatureUrl: filename });
        return this.findOne(id);
    }
    async updateStamp(id, filename) {
        await this.doctorsRepository.update(id, { stampUrl: filename });
        return this.findOne(id);
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map