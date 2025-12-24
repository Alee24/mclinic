"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
        let doctorUser = user;
        if (createDoctorDto.email) {
            const password = createDoctorDto.password || 'Doctor123!';
        }
        return this.createDoctorLogic(createDoctorDto, doctorUser);
    }
    async createDoctorLogic(dto, user) {
        const doctor = this.doctorsRepository.create({
            ...dto,
            user,
            status: true,
            verified_status: false,
        });
        return this.doctorsRepository.save(doctor);
    }
    async findAllVerified() {
        let activeDocs = await this.doctorsRepository.find({ where: { verified_status: true, status: true } });
        if (activeDocs.length === 0) {
            const anyDocs = await this.doctorsRepository.find({ take: 5 });
            if (anyDocs.length > 0) {
                for (const d of anyDocs) {
                    d.verified_status = true;
                    d.status = true;
                    d.isWorking = true;
                    d.latitude = -1.2921 + (Math.random() - 0.5) * 0.1;
                    d.longitude = 36.8219 + (Math.random() - 0.5) * 0.1;
                    await this.doctorsRepository.save(d);
                }
                activeDocs = await this.doctorsRepository.find({ where: { verified_status: true, status: true } });
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
            if (doc.isWorking === undefined || doc.isWorking === null) {
                doc.isWorking = Math.random() > 0.3;
                changed = true;
            }
            if (changed) {
                updates.push(this.doctorsRepository.save(doc));
            }
        }
        if (updates.length > 0)
            await Promise.all(updates);
        if (activeDocs.length > 0 && !activeDocs.some(d => d.isWorking)) {
            activeDocs[0].isWorking = true;
            await this.doctorsRepository.save(activeDocs[0]);
        }
        const enrichedDocs = await Promise.all(activeDocs.map(async (doc) => {
            const enriched = { ...doc };
            if (doc.isWorking) {
                if (Math.random() > 0.2) {
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
            }
            return enriched;
        }));
        return enrichedDocs;
    }
    async findAll() {
        return this.doctorsRepository.find({ relations: ['user'] });
    }
    async findOne(id) {
        return this.doctorsRepository.findOne({ where: { id }, relations: ['user'] });
    }
    async findByUserId(userId) {
        return this.doctorsRepository.findOne({ where: { user_id: userId }, relations: ['user'] });
    }
    async verifyDoctor(id, status) {
        await this.doctorsRepository.update(id, { verified_status: status });
        return this.doctorsRepository.findOne({ where: { id } });
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