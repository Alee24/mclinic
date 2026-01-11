import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { PharmacyOrder, OrderStatus, PaymentMethod, PaymentStatus } from './entities/pharmacy-order.entity'; // Import
import { PharmacyOrderItem } from './entities/pharmacy-order-item.entity'; // Import
import { DoctorsService } from '../doctors/doctors.service';
import { FinancialService } from '../financial/financial.service';

@Injectable()
export class PharmacyService {
    constructor(
        @InjectRepository(Medication)
        private medicationRepo: Repository<Medication>,
        @InjectRepository(Prescription)
        private prescriptionRepo: Repository<Prescription>,
        @InjectRepository(PrescriptionItem)
        private prescriptionItemRepo: Repository<PrescriptionItem>,
        @InjectRepository(PharmacyOrder) // Inject
        private pharmacyOrderRepo: Repository<PharmacyOrder>,
        private readonly doctorsService: DoctorsService,
        @Inject(forwardRef(() => FinancialService))
        private readonly financialService: FinancialService,
    ) { }

    // --- Medications ---

    async findAllMedications() {
        return this.medicationRepo.find();
    }

    async findMedicationById(id: number) {
        return this.medicationRepo.findOne({ where: { id } });
    }

    async createMedication(data: Partial<Medication>) {
        const med = this.medicationRepo.create(data);
        return this.medicationRepo.save(med);
    }

    getMedicationTemplate(): string {
        const headers = [
            'Category',
            'Brand Name',
            'Generic Name',
            'Strength',
            'Formulation',
            'Price',
            'Description',
            'Stock'
        ];
        return headers.join(',') + '\n' + 'Antibiotics,Amoxil,Amoxicillin,500mg,Capsule,500,For infections,100'; // Example row
    }

    // --- Prescriptions ---

    async createPrescription(data: {
        doctorId: number;
        patientId: number;
        appointmentId?: number;
        notes?: string;
        items: {
            medicationId?: number;
            medicationName: string;
            quantity: number;
            dosage?: string;
            frequency?: string;
            duration?: string;
            instructions?: string;
        }[];
    }) {
        // 1. Fetch Doctor Details to get Signature/Stamp & Verify Role
        const doctor = await this.doctorsService.findOne(data.doctorId);
        if (!doctor) throw new NotFoundException('Doctor not found');

        // 2. Role Restriction (Kenyan Law: Nurses/Clinicians restrictions)
        // Adjust logic based on exact titles. Assuming 'Doctor' title or specific specialties.
        // For now, blocking 'Nurse' explicitly if mentioned in requirements.
        const restrictedRoles = ['Nurse', 'Clinician'];
        if (restrictedRoles.includes(doctor.dr_type)) {
            throw new NotFoundException('User role not authorized to prescribe medications.');
        }

        const prescription = this.prescriptionRepo.create({
            doctorId: data.doctorId,
            patientId: data.patientId,
            appointmentId: data.appointmentId,
            notes: data.notes,
            status: PrescriptionStatus.PENDING,
            // 3. Snapshot Credentials
            doctorSignatureUrl: doctor.signatureUrl,
            doctorStampUrl: doctor.stampUrl
        });

        const savedPrescription = await this.prescriptionRepo.save(prescription);

        const items = data.items.map((item) =>
            this.prescriptionItemRepo.create({
                ...item,
                prescriptionId: savedPrescription.id,
            }),
        );

        await this.prescriptionItemRepo.save(items);

        return this.findPrescriptionById(savedPrescription.id);
    }

    async findPrescriptionById(id: number) {
        return this.prescriptionRepo.findOne({
            where: { id },
            relations: ['items', 'items.medication', 'doctor', 'patient'],
        });
    }

    async findPrescriptionsByAppointment(appointmentId: number) {
        return this.prescriptionRepo.find({
            where: { appointmentId },
            relations: ['items', 'items.medication', 'doctor'],
        });
    }

    async getPatientPrescriptions(patientId: number) {
        return this.prescriptionRepo.find({
            where: { patientId },
            relations: ['items', 'items.medication', 'doctor', 'appointment'],
            order: { createdAt: 'DESC' },
        });
    }

    async getDoctorPrescriptions(doctorId: number) {
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

    async updatePrescriptionStatus(id: number, status: PrescriptionStatus) {
        const prescription = await this.findPrescriptionById(id);
        if (!prescription) throw new NotFoundException('Prescription not found');

        prescription.status = status;
        return this.prescriptionRepo.save(prescription);
    }
    // --- Orders ---

    async createOrder(data: {
        userId: number;
        prescriptionId?: string;
        deliveryAddress: string;
        deliveryCity: string;
        contactPhone: string;
        paymentMethod: PaymentMethod;
        items: {
            medicationId: string;
            quantity: number;
        }[];
    }) {
        let totalAmount = 0;
        const orderItems: PharmacyOrderItem[] = [];

        // 1. Process Items & Calculate Total
        for (const item of data.items) {
            // For now, assuming standard Medication entity is used as Inventory (or we map it)
            // Ideally we should have a separate Inventory entity, but using Medication for price/stock
            const med = await this.medicationRepo.findOne({ where: { id: Number(item.medicationId) } }); // Cast to number if Medication uses number IDs

            if (!med) throw new NotFoundException(`Medication ${item.medicationId} not found`);

            if (med.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${med.name}`);
            }

            // Snapshot Price
            const price = Number(med.price);
            const subtotal = price * item.quantity;
            totalAmount += subtotal;

            // Create Order Item
            const orderItem = new PharmacyOrderItem();
            orderItem.medication = med as any; // Temporary cast if type mismatch
            orderItem.medicationId = String(med.id);
            orderItem.medicationName = med.name;
            orderItem.quantity = item.quantity;
            orderItem.price = price;
            orderItem.subtotal = subtotal;

            orderItems.push(orderItem);

            // Decrement Stock
            med.stock -= item.quantity;
            await this.medicationRepo.save(med);
        }

        // 2. Create Order
        const order = this.pharmacyOrderRepo.create({
            userId: Number(data.userId),
            prescriptionId: data.prescriptionId,
            deliveryAddress: data.deliveryAddress,
            deliveryCity: data.deliveryCity,
            contactPhone: data.contactPhone,
            paymentMethod: data.paymentMethod,
            totalAmount: totalAmount,
            items: orderItems,
            status: OrderStatus.PAID,
            paymentStatus: PaymentStatus.COMPLETED
        });

        // 3. Generate Invoice
        let invoiceId: number | null = null;
        try {
            // Fetch user details for invoice
            const invoice = await this.financialService.createInvoice({
                customerName: `User #${data.userId}`, // Will be updated with actual name
                customerEmail: `user${data.userId}@mclinic.co.ke`, // Placeholder
                dueDate: new Date(),
                items: orderItems.map(item => ({
                    description: `${item.medicationName} (Qty: ${item.quantity})`,
                    quantity: item.quantity,
                    unitPrice: item.price,
                })),
                invoiceNumber: `PH-${Date.now().toString().slice(-8)}`,
            });
            invoiceId = invoice.id;

            // Mark invoice as paid immediately (simulated payment)
            await this.financialService.updateInvoice(invoice.id, {
                status: 'paid',
                paymentMethod: data.paymentMethod,
            });
        } catch (e) {
            console.error("Failed to generate invoice", e);
        }

        // 4. Update order with invoice ID
        if (invoiceId) {
            order.invoiceId = invoiceId;
        }

        // 5. Sync Prescription Status if applicable
        if (data.prescriptionId) {
            // Find prescription to ensure it exists and we're not just using a random ID
            // Ideally we should have validated this earlier, but doing it here for status update
            try {
                // Assuming we can access prescriptionRepo here
                await this.prescriptionRepo.update(data.prescriptionId, { status: PrescriptionStatus.ORDERED });
            } catch (e) {
                console.error("Failed to update prescription status", e);
            }
        }

        return this.pharmacyOrderRepo.save(order);
    }

    async getUserOrders(userId: number | string) {
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

    async updateOrderStatus(id: string, status: OrderStatus) {
        return this.pharmacyOrderRepo.update(id, { status });
    }

    async uploadMedications(file: Express.Multer.File) {
        const csv = file.buffer.toString();
        const lines = csv.split('\n');
        // Skip header
        const rows = lines.slice(1);
        let updatedCount = 0;
        let createdCount = 0;

        for (const row of rows) {
            if (!row.trim()) continue;
            // Headers: Category,Brand Name,Generic Name,Strength,Formulation,Price,Description,Stock
            // Note: Handle potential comma in description later if needed (simple split for MVP)
            const cols = row.split(',');
            if (cols.length < 8) continue;

            const category = cols[0]?.trim();
            const brandName = cols[1]?.trim();
            const genericName = cols[2]?.trim();
            const strength = cols[3]?.trim();
            const formulation = cols[4]?.trim();
            const price = parseFloat(cols[5]?.trim() || '0');
            const description = cols[6]?.trim();
            const stock = parseInt(cols[7]?.trim() || '0');

            // Strategy: Match by Brand Name AND Generic Name AND Strength AND Formulation to be precise, 
            // OR just Brand Name if unique. Let's use Brand Name for now as primary identifier if provided.
            let med: Medication | null = null;
            if (brandName) {
                med = await this.medicationRepo.findOne({ where: { brandName } });
            }

            // Fallback: Check 'name' column for legacy compatibility if brandName was empty in CSV but maybe user meant 'Name'
            // We are using 'name' in DB as primary display, let's map Brand Name to Name as well.
            const displayName = brandName || genericName || 'Unknown';

            if (med) {
                med.category = category;
                med.genericName = genericName;
                med.strength = strength;
                med.formulation = formulation;
                med.price = price;
                med.description = description;
                med.stock = stock; // Optional: Add to stock instead of overwrite? Requirements say "upload", usually implies sync or add. Let's overwrite for consistency with "Update".
                await this.medicationRepo.save(med);
                updatedCount++;
            } else {
                const newMed = this.medicationRepo.create({
                    name: displayName,
                    brandName,
                    genericName,
                    category,
                    strength,
                    formulation,
                    price,
                    description,
                    stock,
                    requiresPrescription: true // Default
                });
                await this.medicationRepo.save(newMed);
                createdCount++;
            }
        }
        return { success: true, message: `Processed ${rows.length} rows. Created: ${createdCount}, Updated: ${updatedCount}` };
    }
}
