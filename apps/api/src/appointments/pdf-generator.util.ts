import PDFDocument from 'pdfkit';
import { Appointment } from './entities/appointment.entity';
import * as path from 'path';
import * as fs from 'fs';

export async function generateAppointmentPdf(
  appointment: Appointment,
  prescriptions: any[],
  labOrders: any[],
  medicalRecords: any[],
  medicRecommendations: any[],
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Colors matching the UI exactly
      const BRAND_COLOR = '#0B6E40';
      const CARD_BG = '#FFFFFF';
      const BORDER_COLOR = '#EFEFEF';
      const TEXT_MAIN = '#111827';
      const TEXT_MUTED = '#6B7280';
      const TEXT_LABEL = '#9CA3AF';
      const BADGE_GREEN_BG = '#D1FAE5';
      const BADGE_GREEN_TEXT = '#065F46';
      const BADGE_TEAL_BG = '#CCFBF1';
      const BADGE_TEAL_TEXT = '#0F766E';
      const BADGE_YELLOW_BG = '#FEF3C7';
      const BADGE_YELLOW_TEXT = '#92400E';

      // --- Helper Functions for UI drawing ---
      function drawRoundedRect(x: number, y: number, w: number, h: number, r: number, fillColor: string, strokeColor?: string) {
        doc.roundedRect(x, y, w, h, r).fill(fillColor);
        if (strokeColor) {
          doc.roundedRect(x, y, w, h, r).lineWidth(1).stroke(strokeColor);
        }
      }

      function drawBadge(text: string, x: number, y: number, bgColor: string, textColor: string) {
        doc.fontSize(8).font('Helvetica-Bold');
        const textWidth = doc.widthOfString(text) + 12;
        drawRoundedRect(x, y, textWidth, 14, 4, bgColor);
        doc.fillColor(textColor).text(text, x + 6, y + 4);
        return textWidth;
      }

      function drawIconPlaceholder(x: number, y: number, char: string, color: string) {
        drawRoundedRect(x, y, 24, 24, 12, '#F3F4F6');
        doc.fillColor(color).font('Helvetica-Bold').fontSize(12).text(char, x + 8, y + 6);
      }

      // --- 1. Header & Logo ---
      const logoPath = path.join(process.cwd(), 'uploads', 'system', 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 40, { width: 120 });
      } else {
        doc.fillColor(BRAND_COLOR).fontSize(24).font('Helvetica-Bold').text('Mclinic', 40, 40);
      }
      
      doc.fillColor(TEXT_MUTED).fontSize(10).font('Helvetica')
        .text('Generated from Mclinic Portal', 0, 45, { align: 'right' })
        .text(new Date().toLocaleString(), { align: 'right' });
      
      doc.moveDown(2);

      // Two Column Layout
      const leftColX = 40;
      const leftColW = 240;
      const rightColX = 300;
      const rightColW = 255;
      
      let leftY = 90;
      let rightY = 90;

      // --- LEFT COLUMN ---
      // 1. Appointment Details Card
      drawRoundedRect(leftColX, leftY, leftColW, 240, 16, CARD_BG, BORDER_COLOR);
      doc.fillColor(TEXT_LABEL).fontSize(10).font('Helvetica-Bold').text('APPOINTMENT DETAILS', leftColX + 20, leftY + 20);
      
      let rowY = leftY + 45;
      const patient: any = appointment.patient || {};
      const appt: any = appointment;

      // Date & Time
      drawIconPlaceholder(leftColX + 20, rowY, 'C', TEXT_MUTED); // Calendar
      doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text('Date & Time', leftColX + 55, rowY);
      doc.fillColor(TEXT_MAIN).fontSize(11).font('Helvetica-Bold').text(`${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.appointment_time || 'N/A'}`, leftColX + 55, rowY + 10);
      
      rowY += 35;
      // Status
      drawIconPlaceholder(leftColX + 20, rowY, 'S', TEXT_MUTED); // Status/Pulse
      doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text('Appointment Status', leftColX + 55, rowY);
      drawBadge((appointment.status || 'CONFIRMED').toUpperCase(), leftColX + 55, rowY + 12, BADGE_GREEN_BG, BADGE_GREEN_TEXT);

      rowY += 35;
      // Service Type
      drawIconPlaceholder(leftColX + 20, rowY, 'T', TEXT_MUTED); // Type/Briefcase
      doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text('Service Type', leftColX + 55, rowY);
      doc.fillColor(TEXT_MAIN).fontSize(11).font('Helvetica-Bold').text(appointment.service?.name || (appointment.isConcierge ? 'Medical Concierge' : 'General Consultation'), leftColX + 55, rowY + 10);

      rowY += 35;
      // Mode
      drawIconPlaceholder(leftColX + 20, rowY, 'M', TEXT_MUTED); // Mode/Home
      doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text('Consultation Mode', leftColX + 55, rowY);
      const modeText = appointment.isVirtual ? 'VIRTUAL VISIT' : 'PHYSICAL HOME VISIT';
      drawBadge(modeText, leftColX + 55, rowY + 12, BADGE_TEAL_BG, BADGE_TEAL_TEXT);

      rowY += 35;
      // Fee
      drawIconPlaceholder(leftColX + 20, rowY, '$', TEXT_MUTED); // Fee
      doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text('Fee', leftColX + 55, rowY);
      doc.fillColor(TEXT_MAIN).fontSize(11).font('Helvetica-Bold').text(`KES ${appt.fee || 0}`, leftColX + 55, rowY + 10);
      if (appt.transportFee) {
        doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text(`Transport: KES ${appt.transportFee}`, leftColX + 55, rowY + 22);
      }

      leftY += 260;

      // 2. Contact Details Card
      drawRoundedRect(leftColX, leftY, leftColW, 140, 16, CARD_BG, BORDER_COLOR);
      doc.fillColor(TEXT_LABEL).fontSize(10).font('Helvetica-Bold').text('CONTACT DETAILS', leftColX + 20, leftY + 20);
      
      let contactY = leftY + 45;
      doc.fillColor(TEXT_MUTED).fontSize(10).font('Helvetica');
      doc.text(`P   ${patient.mobile || patient.phone || 'N/A'}`, leftColX + 20, contactY); // Phone
      contactY += 20;
      doc.text(`E   ${patient.email || 'N/A'}`, leftColX + 20, contactY); // Email
      contactY += 20;
      doc.text(`H   ${patient.hospital || patient.nearest_hospital || 'N/A'}`, leftColX + 20, contactY); // Hospital
      contactY += 20;
      doc.text(`C   ${patient.city || patient.location || 'N/A'}`, leftColX + 20, contactY); // City

      leftY += 160;

      // --- RIGHT COLUMN ---
      // 1. Patient Location (Map Snippet)
      drawRoundedRect(rightColX, rightY, rightColW, 200, 16, CARD_BG, BORDER_COLOR);
      doc.fillColor(TEXT_LABEL).fontSize(10).font('Helvetica-Bold').text('PATIENT LOCATION', rightColX + 20, rightY + 20);
      
      const lat = appt.latitude;
      const lon = appt.longitude;
      
      if (lat && lon) {
        try {
          // Fetch static map from OSM static map API (no auth required)
          const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=14&size=400x200&maptype=mapnik&markers=${lat},${lon},lightblue`;
          const response = await fetch(mapUrl);
          const arrayBuffer = await response.arrayBuffer();
          const mapBuffer = Buffer.from(arrayBuffer);
          
          doc.image(mapBuffer, rightColX + 10, rightY + 40, { width: rightColW - 20, height: 140 });
          // Draw a border around map
          drawRoundedRect(rightColX + 10, rightY + 40, rightColW - 20, 140, 8, '', BORDER_COLOR);
        } catch (e) {
          // Fallback if map fetch fails
          drawRoundedRect(rightColX + 10, rightY + 40, rightColW - 20, 140, 8, '#F9FAFB', BORDER_COLOR);
          doc.fillColor(TEXT_MUTED).fontSize(10).font('Helvetica').text('Map image unavailable', rightColX + 80, rightY + 100);
        }
      } else {
        drawRoundedRect(rightColX + 10, rightY + 40, rightColW - 20, 140, 8, '#F9FAFB', BORDER_COLOR);
        doc.fillColor(TEXT_MUTED).fontSize(10).font('Helvetica').text('No coordinates provided', rightColX + 70, rightY + 100);
      }

      rightY += 220;

      // 2. Prescriptions / Clinical Data Card
      // We will make this card extend downwards
      drawRoundedRect(rightColX, rightY, rightColW, 280, 16, CARD_BG, BORDER_COLOR);
      doc.fillColor(TEXT_LABEL).fontSize(10).font('Helvetica-Bold').text('CLINICAL SUMMARY & PRESCRIPTIONS', rightColX + 20, rightY + 20);
      
      let clinY = rightY + 45;

      // Medical Notes
      if (medicalRecords && medicalRecords.length > 0) {
          doc.fillColor(TEXT_MAIN).fontSize(9).font('Helvetica-Bold').text('Reason / Diagnosis:', rightColX + 20, clinY);
          clinY += 12;
          doc.fillColor(TEXT_MUTED).font('Helvetica').text(medicalRecords[0].diagnosis || 'No diagnosis', rightColX + 20, clinY);
          clinY += 25;
      } else if (appointment.reason) {
          doc.fillColor(TEXT_MAIN).fontSize(9).font('Helvetica-Bold').text('Reason for Visit:', rightColX + 20, clinY);
          clinY += 12;
          doc.fillColor(TEXT_MUTED).font('Helvetica').text(appointment.reason, rightColX + 20, clinY);
          clinY += 25;
      }

      // Prescriptions List
      if (prescriptions && prescriptions.length > 0) {
        prescriptions.forEach((rx, idx) => {
          if (clinY > rightY + 240) return; // Prevent overflow
          
          doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text(`Prescription #${idx + 1}`, rightColX + 20, clinY);
          drawBadge(rx.status || 'PENDING', rightColX + 180, clinY - 2, BADGE_YELLOW_BG, BADGE_YELLOW_TEXT);
          clinY += 12;
          doc.fillColor(TEXT_MUTED).fontSize(7).text(new Date(rx.createdAt).toLocaleDateString(), rightColX + 20, clinY);
          clinY += 15;
          
          if (rx.items) {
            rx.items.forEach((item: any) => {
               if (clinY > rightY + 260) return;
               doc.fillColor(TEXT_MAIN).fontSize(9).font('Helvetica-Bold').text(item.medicationName || item.medication?.name || 'Medication', rightColX + 20, clinY);
               doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text(`${item.dosage} • ${item.frequency}`, rightColX + 150, clinY);
               clinY += 15;
            });
          }
          clinY += 10;
        });
      } else {
         doc.fillColor(TEXT_MUTED).fontSize(9).font('Helvetica-Oblique').text('No prescriptions issued.', rightColX + 20, clinY);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
