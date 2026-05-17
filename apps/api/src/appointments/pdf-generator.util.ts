import PDFDocument from 'pdfkit';
import { Appointment } from './entities/appointment.entity';
import * as path from 'path';
import * as fs from 'fs';

export async function generateAppointmentPdf(
  appointment: Appointment,
  prescriptions: any[],
  labOrders: any[],
  medicalRecords: any[],
  medicRecommendations: any[], // if available
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Colors matching the brand (#0B6E40)
      const BRAND_COLOR = '#0B6E40';
      const TEXT_COLOR = '#333333';
      const LIGHT_BG = '#F0FDF4';

      // --- 1. Header Section ---
      // Try to load logo
      const logoPath = path.join(process.cwd(), 'uploads', 'system', 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 100 });
      } else {
        // Fallback text if logo not found
        doc.fillColor(BRAND_COLOR)
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('Mclinic', 50, 50);
      }

      // Company info right aligned
      doc.fillColor(TEXT_COLOR)
        .fontSize(10)
        .font('Helvetica')
        .text('Mclinic Kenya', 0, 50, { align: 'right' })
        .text('Nairobi, Kenya', { align: 'right' })
        .text('support@mclinic.co.ke', { align: 'right' })
        .text('+254 700 000000', { align: 'right' });

      doc.moveDown(2);
      
      // Divider
      doc.strokeColor(BRAND_COLOR).lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(2);

      // --- 2. Report Title ---
      doc.fillColor(BRAND_COLOR)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('MEDICAL APPOINTMENT REPORT', { align: 'center' });
      
      doc.moveDown(1.5);

      // --- 3. Overview details (Patient, Medic, Date) ---
      const patient = appointment.patient || ({} as any);
      const doctor = appointment.doctor || ({} as any);

      const patientName = patient.fname ? `${patient.fname} ${patient.lname}` : 'Unknown Patient';
      const medicName = doctor.fname ? `Dr. ${doctor.fname} ${doctor.lname}` : (appointment.isConcierge ? 'Mclinic Concierge' : 'Unassigned');

      const apptDate = appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'N/A';
      const apptTime = appointment.appointment_time || 'N/A';
      const apptStatus = (appointment.status || 'N/A').toUpperCase();

      doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_COLOR).text('1. APPOINTMENT OVERVIEW');
      doc.moveDown(0.5);

      const startY = doc.y;
      
      // Left Col
      doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT_COLOR).text('Patient Name:', 50, startY);
      doc.font('Helvetica').text(patientName, 130, startY);
      
      doc.font('Helvetica-Bold').text('Patient Contact:', 50, startY + 15);
      doc.font('Helvetica').text(patient.mobile || patient.email || 'N/A', 145, startY + 15);

      doc.font('Helvetica-Bold').text('Appointment ID:', 50, startY + 30);
      doc.font('Helvetica').text(`#${appointment.id}`, 140, startY + 30);

      // Right Col
      doc.font('Helvetica-Bold').text('Attending Medic:', 300, startY);
      doc.font('Helvetica').text(medicName, 395, startY);

      doc.font('Helvetica-Bold').text('Date & Time:', 300, startY + 15);
      doc.font('Helvetica').text(`${apptDate} @ ${apptTime}`, 375, startY + 15);

      doc.font('Helvetica-Bold').text('Status:', 300, startY + 30);
      doc.font('Helvetica').text(apptStatus, 345, startY + 30);

      doc.y = startY + 55;
      
      // Service details
      doc.font('Helvetica-Bold').text('Service:', 50, doc.y);
      doc.font('Helvetica').text(appointment.service?.name || (appointment.isConcierge ? 'Medical Concierge' : 'General Consultation'), 100, doc.y);
      doc.y += 15;
      doc.font('Helvetica-Bold').text('Mode:', 50, doc.y);
      doc.font('Helvetica').text(appointment.isVirtual ? 'Virtual Meeting' : 'Physical Visit', 90, doc.y);
      
      doc.moveDown(2);

      // --- 4. Diagnosis & Records ---
      doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_COLOR).text('2. DIAGNOSIS & CLINICAL NOTES');
      doc.moveDown(0.5);
      if (medicalRecords && medicalRecords.length > 0) {
        medicalRecords.forEach((record, index) => {
          doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT_COLOR).text(`Diagnosis ${index + 1}: `, { continued: true });
          doc.font('Helvetica').text(record.diagnosis || 'N/A');
          if (record.notes) {
            doc.font('Helvetica').fontSize(10).text(`Notes: ${record.notes}`);
          }
          doc.moveDown(0.5);
        });
      } else {
        doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR).text('No clinical notes or diagnosis recorded for this visit.');
      }
      doc.moveDown(1.5);

      // --- 5. Prescriptions ---
      doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_COLOR).text('3. PRESCRIBED MEDICATIONS');
      doc.moveDown(0.5);
      if (prescriptions && prescriptions.length > 0) {
        prescriptions.forEach((rx, index) => {
          doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT_COLOR).text(`Prescription #${rx.id || index + 1} (${new Date(rx.createdAt).toLocaleDateString()})`);
          if (rx.items && rx.items.length > 0) {
            rx.items.forEach((item: any) => {
              doc.font('Helvetica').fontSize(10).text(`• ${item.medicationName} - ${item.dosage} (${item.frequency})`);
            });
          } else {
             doc.font('Helvetica').fontSize(10).text('• No specific items listed');
          }
          doc.moveDown(0.5);
        });
      } else {
        doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR).text('No medications prescribed during this visit.');
      }
      doc.moveDown(1.5);

      // --- 6. Lab Tests ---
      doc.font('Helvetica-Bold').fontSize(12).fillColor(BRAND_COLOR).text('4. LABORATORY TESTS');
      doc.moveDown(0.5);
      if (labOrders && labOrders.length > 0) {
        labOrders.forEach((order, index) => {
           doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT_COLOR).text(`Test #${order.id || index + 1}: `, { continued: true });
           doc.font('Helvetica').text(order.test?.name || 'Unknown Lab Test');
           if (order.notes) {
              doc.font('Helvetica').fontSize(10).text(`  Instructions: ${order.notes}`);
           }
           doc.moveDown(0.5);
        });
      } else {
        doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR).text('No laboratory tests ordered.');
      }
      doc.moveDown(1.5);

      // --- Footer ---
      const bottom = doc.page.height - 50;
      doc.font('Helvetica').fontSize(8).fillColor('gray').text('This is a computer-generated document. It does not require a signature.', 50, bottom, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, bottom + 15, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
