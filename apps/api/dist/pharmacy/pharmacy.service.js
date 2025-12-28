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
exports.PharmacyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medication_entity_1 = require("./entities/medication.entity");
const prescription_entity_1 = require("./entities/prescription.entity");
const prescription_item_entity_1 = require("./entities/prescription-item.entity");
const pharmacy_order_entity_1 = require("./entities/pharmacy-order.entity");
const pharmacy_order_item_entity_1 = require("./entities/pharmacy-order-item.entity");
const doctors_service_1 = require("../doctors/doctors.service");
const financial_service_1 = require("../financial/financial.service");
let PharmacyService = class PharmacyService {
    medicationRepo;
    prescriptionRepo;
    prescriptionItemRepo;
    pharmacyOrderRepo;
    doctorsService;
    financialService;
    constructor(medicationRepo, prescriptionRepo, prescriptionItemRepo, pharmacyOrderRepo, doctorsService, financialService) {
        this.medicationRepo = medicationRepo;
        this.prescriptionRepo = prescriptionRepo;
        this.prescriptionItemRepo = prescriptionItemRepo;
        this.pharmacyOrderRepo = pharmacyOrderRepo;
        this.doctorsService = doctorsService;
        this.financialService = financialService;
    }
    async findAllMedications() {
        return this.medicationRepo.find();
    }
    async findMedicationById(id) {
        return this.medicationRepo.findOne({ where: { id } });
    }
    async createMedication(data) {
        const med = this.medicationRepo.create(data);
        return this.medicationRepo.save(med);
    }
    async createPrescription(data) {
        const doctor = await this.doctorsService.findOne(data.doctorId);
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        const restrictedRoles = ['Nurse', 'Clinician'];
        if (restrictedRoles.includes(doctor.dr_type)) {
            throw new common_1.NotFoundException('User role not authorized to prescribe medications.');
        }
        const prescription = this.prescriptionRepo.create({
            doctorId: data.doctorId,
            patientId: data.patientId,
            appointmentId: data.appointmentId,
            notes: data.notes,
            status: prescription_entity_1.PrescriptionStatus.PENDING,
            doctorSignatureUrl: doctor.signatureUrl,
            doctorStampUrl: doctor.stampUrl
        });
        const savedPrescription = await this.prescriptionRepo.save(prescription);
        const items = data.items.map((item) => this.prescriptionItemRepo.create({
            ...item,
            prescriptionId: savedPrescription.id,
        }));
        await this.prescriptionItemRepo.save(items);
        return this.findPrescriptionById(savedPrescription.id);
    }
    async findPrescriptionById(id) {
        return this.prescriptionRepo.findOne({
            where: { id },
            relations: ['items', 'items.medication', 'doctor', 'patient'],
        });
    }
    async findPrescriptionsByAppointment(appointmentId) {
        return this.prescriptionRepo.find({
            where: { appointmentId },
            relations: ['items', 'items.medication', 'doctor'],
        });
    }
    async getPatientPrescriptions(patientId) {
        return this.prescriptionRepo.find({
            where: { patientId },
            relations: ['items', 'items.medication', 'doctor', 'appointment'],
            order: { createdAt: 'DESC' },
        });
    }
    async getDoctorPrescriptions(doctorId) {
        return this.prescriptionRepo.find({
            where: { doctorId },
            relations: ['items', 'items.medication', 'patient', 'appointment'],
            order: { createdAt: 'DESC' },
        });
    }
    async getAllPrescriptions() {
        return this.prescriptionRepo.find({
            relations: ['items', 'items.medication', 'doctor', 'patient'],
            order: { createdAt: 'DESC' },
        });
    }
    async updatePrescriptionStatus(id, status) {
        const prescription = await this.findPrescriptionById(id);
        if (!prescription)
            throw new common_1.NotFoundException('Prescription not found');
        prescription.status = status;
        return this.prescriptionRepo.save(prescription);
    }
    async createOrder(data) {
        let totalAmount = 0;
        const orderItems = [];
        for (const item of data.items) {
            const med = await this.medicationRepo.findOne({ where: { id: Number(item.medicationId) } });
            if (!med)
                throw new common_1.NotFoundException(`Medication ${item.medicationId} not found`);
            if (med.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${med.name}`);
            }
            const price = Number(med.price);
            const subtotal = price * item.quantity;
            totalAmount += subtotal;
            const orderItem = new pharmacy_order_item_entity_1.PharmacyOrderItem();
            orderItem.medication = med;
            orderItem.medicationId = String(med.id);
            orderItem.medicationName = med.name;
            orderItem.quantity = item.quantity;
            orderItem.price = price;
            orderItem.subtotal = subtotal;
            orderItems.push(orderItem);
            med.stock -= item.quantity;
            await this.medicationRepo.save(med);
        }
        const order = this.pharmacyOrderRepo.create({
            userId: Number(data.userId),
            prescriptionId: data.prescriptionId,
            deliveryAddress: data.deliveryAddress,
            deliveryCity: data.deliveryCity,
            contactPhone: data.contactPhone,
            paymentMethod: data.paymentMethod,
            totalAmount: totalAmount,
            items: orderItems,
            status: pharmacy_order_entity_1.OrderStatus.PAID,
            paymentStatus: pharmacy_order_entity_1.PaymentStatus.COMPLETED
        });
        let invoiceId = null;
        try {
            const invoice = await this.financialService.createInvoice({
                customerName: `User #${data.userId}`,
                customerEmail: `user${data.userId}@mclinic.co.ke`,
                dueDate: new Date(),
                items: orderItems.map(item => ({
                    description: `${item.medicationName} (Qty: ${item.quantity})`,
                    quantity: item.quantity,
                    unitPrice: item.price,
                })),
                invoiceNumber: `PH-${Date.now().toString().slice(-8)}`,
            });
            invoiceId = invoice.id;
            await this.financialService.updateInvoice(invoice.id, {
                status: 'paid',
                paymentMethod: data.paymentMethod,
            });
        }
        catch (e) {
            console.error("Failed to generate invoice", e);
        }
        if (invoiceId) {
            order.invoiceId = invoiceId;
        }
        if (data.prescriptionId) {
            try {
                await this.prescriptionRepo.update(data.prescriptionId, { status: prescription_entity_1.PrescriptionStatus.ORDERED });
            }
            catch (e) {
                console.error("Failed to update prescription status", e);
            }
        }
        return this.pharmacyOrderRepo.save(order);
    }
    async getUserOrders(userId) {
        return this.pharmacyOrderRepo.find({
            where: { userId: Number(userId) },
            relations: ['items', 'invoice'],
            order: { createdAt: 'DESC' }
        });
    }
    async getAllOrders() {
        return this.pharmacyOrderRepo.find({
            relations: ['items', 'items.medication', 'user', 'invoice'],
            order: { createdAt: 'DESC' }
        });
    }
    async updateOrderStatus(id, status) {
        return this.pharmacyOrderRepo.update(id, { status });
    }
};
exports.PharmacyService = PharmacyService;
exports.PharmacyService = PharmacyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medication_entity_1.Medication)),
    __param(1, (0, typeorm_1.InjectRepository)(prescription_entity_1.Prescription)),
    __param(2, (0, typeorm_1.InjectRepository)(prescription_item_entity_1.PrescriptionItem)),
    __param(3, (0, typeorm_1.InjectRepository)(pharmacy_order_entity_1.PharmacyOrder)),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => financial_service_1.FinancialService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        doctors_service_1.DoctorsService,
        financial_service_1.FinancialService])
], PharmacyService);
//# sourceMappingURL=pharmacy.service.js.map