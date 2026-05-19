import PDFDocument from 'pdfkit';
import { Appointment } from './entities/appointment.entity';
import * as path from 'path';
import * as fs from 'fs';

// ─── Colour Palette ────────────────────────────────────────────────────────────
const C = {
  brand:      '#087c46',
  brandDark:  '#065a33',
  brandLight: '#e6f4ee',
  black:      '#111827',
  muted:      '#6B7280',
  label:      '#9CA3AF',
  border:     '#E5E7EB',
  bgCard:     '#FFFFFF',
  bgPage:     '#F9FAFB',
  badgeGreenBg:   '#D1FAE5',
  badgeGreenTxt:  '#065F46',
  badgeTealBg:    '#CCFBF1',
  badgeTealTxt:   '#0F766E',
  badgeYellowBg:  '#FEF3C7',
  badgeYellowTxt: '#92400E',
  badgeBlueBg:    '#DBEAFE',
  badgeBlueTxt:   '#1E40AF',
  badgeRedBg:     '#FEE2E2',
  badgeRedTxt:    '#991B1B',
  starFilled:     '#F59E0B',
  starEmpty:      '#D1D5DB',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDate(d: any): string {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateTime(d: any): string {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statusColors(s: string): { bg: string; txt: string } {
  const m: Record<string, { bg: string; txt: string }> = {
    completed:   { bg: C.badgeGreenBg,  txt: C.badgeGreenTxt  },
    confirmed:   { bg: C.badgeBlueBg,   txt: C.badgeBlueTxt   },
    pending:     { bg: C.badgeYellowBg, txt: C.badgeYellowTxt },
    cancelled:   { bg: C.badgeRedBg,    txt: C.badgeRedTxt    },
    rescheduled: { bg: C.badgeYellowBg, txt: C.badgeYellowTxt },
  };
  return m[s?.toLowerCase()] ?? { bg: C.badgeGreenBg, txt: C.badgeGreenTxt };
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export async function generateAppointmentPdf(
  appointment: Appointment,
  prescriptions: any[],
  labOrders: any[],
  medicalRecords: any[],
  medicRecommendations: any[],
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4', autoFirstPage: true });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const PW = doc.page.width;   // 595
      const PH = doc.page.height;  // 842
      const MARGIN = 40;
      const INNER  = PW - MARGIN * 2;

      const appt: any  = appointment;
      const patient: any = appointment.patient  || {};
      const doctor: any  = appointment.doctor   || {};
      const review: any  = (appointment as any).review || null;

      // ── helpers ────────────────────────────────────────────────────────────
      const rr = (x: number, y: number, w: number, h: number, r: number,
                  fill: string, stroke?: string) => {
        doc.roundedRect(x, y, w, h, r).fill(fill);
        if (stroke) doc.roundedRect(x, y, w, h, r).lineWidth(0.5).stroke(stroke);
      };

      const badge = (text: string, x: number, y: number, bg: string, fg: string) => {
        doc.fontSize(7).font('Helvetica-Bold');
        const w = doc.widthOfString(text) + 14;
        rr(x, y, w, 14, 4, bg);
        doc.fillColor(fg).text(text, x + 7, y + 3.5);
        return w;
      };

      const sectionTitle = (label: string, x: number, y: number, w: number) => {
        doc.fillColor(C.brand).fontSize(7).font('Helvetica-Bold')
           .text(label.toUpperCase(), x, y, { width: w, characterSpacing: 1.2 });
        doc.moveTo(x, y + 12).lineTo(x + w, y + 12).lineWidth(0.5).stroke(C.brand);
        return y + 18;
      };

      const kv = (label: string, value: string, x: number, y: number, w: number) => {
        doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text(label, x, y, { width: w });
        doc.fillColor(C.black).fontSize(9).font('Helvetica-Bold').text(value || 'N/A', x, y + 10, { width: w });
        return y + 26;
      };

      // ── PAGE HEADER ────────────────────────────────────────────────────────
      // Green top bar
      rr(0, 0, PW, 70, 0, C.brand);

      const logoPath = path.join(process.cwd(), 'uploads', 'system', 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, MARGIN, 12, { height: 45 });
      } else {
        doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('M-Clinic', MARGIN, 22);
      }

      // Report title in header
      doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold')
         .text('APPOINTMENT REPORT', 0, 18, { align: 'center' });
      doc.fillColor('rgba(255,255,255,0.75)').fontSize(8).font('Helvetica')
         .text(`Reference: APT-${appt.id}  •  Generated: ${fmtDateTime(new Date())}`, 0, 36, { align: 'center' });

      // Report ID badge top-right
      doc.fillColor('rgba(255,255,255,0.6)').fontSize(7).font('Helvetica')
         .text('M-CLINIC SECURE DOCUMENT', PW - MARGIN - 120, 22, { width: 120, align: 'right' })
         .text('portal.mclinic.co.ke', PW - MARGIN - 120, 32, { width: 120, align: 'right' });

      // ── STATUS RIBBON ──────────────────────────────────────────────────────
      const sc = statusColors(appt.status);
      rr(0, 70, PW, 28, 0, sc.bg);
      doc.fillColor(sc.txt).fontSize(9).font('Helvetica-Bold')
         .text(`STATUS: ${(appt.status || 'PENDING').toUpperCase()}  •  Appointment #${appt.id}  •  ${fmtDate(appt.appointment_date)} at ${appt.appointment_time || 'N/A'}`,
               0, 78, { align: 'center' });

      let Y = 112;

      // ── SECTION 1: PATIENT & DOCTOR INFO ──────────────────────────────────
      const colW = (INNER - 12) / 2;
      const colR = MARGIN + colW + 12;

      // Patient card
      rr(MARGIN, Y, colW, 170, 8, C.bgCard, C.border);
      let ty = sectionTitle('Patient Information', MARGIN + 14, Y + 14, colW - 28);
      ty = kv('Full Name',    `${patient.fname || ''} ${patient.lname || ''}`.trim(), MARGIN + 14, ty, colW - 28);
      ty = kv('Email',        patient.email   || 'N/A', MARGIN + 14, ty, colW - 28);
      ty = kv('Mobile',       patient.mobile  || patient.phone || 'N/A', MARGIN + 14, ty, colW - 28);
      ty = kv('City / Area',  patient.city    || patient.location || 'N/A', MARGIN + 14, ty, colW - 28);
      kv('Blood Group', (patient as any).blood_group || 'N/A', MARGIN + 14, ty, colW - 28);

      // Patient for (beneficiary)
      if (appt.isForSelf === false && appt.beneficiaryName) {
        rr(MARGIN, Y + 175, colW, 60, 8, C.brandLight, C.brand);
        let by = sectionTitle('Appointment For (Beneficiary)', MARGIN + 14, Y + 189, colW - 28);
        doc.fillColor(C.black).fontSize(9).font('Helvetica-Bold')
           .text(`${appt.beneficiaryName}  •  ${appt.beneficiaryAge || '?'} yrs  •  ${appt.beneficiaryGender || ''}  (${appt.beneficiaryRelation || ''})`,
                 MARGIN + 14, by, { width: colW - 28 });
      }

      // Doctor card
      rr(colR, Y, colW, 170, 8, C.bgCard, C.border);
      let dy = sectionTitle('Attending Medic', colR + 14, Y + 14, colW - 28);
      dy = kv('Name',        `Dr. ${doctor.fname || ''} ${doctor.lname || ''}`.trim(), colR + 14, dy, colW - 28);
      dy = kv('Specialty',   doctor.speciality  || doctor.dr_type || 'N/A', colR + 14, dy, colW - 28);
      dy = kv('Qualification', doctor.qualification || 'N/A', colR + 14, dy, colW - 28);
      dy = kv('Licence No',  doctor.licenceNo   || 'N/A', colR + 14, dy, colW - 28);
      kv('Experience', doctor.years_of_experience ? `${doctor.years_of_experience} years` : 'N/A', colR + 14, dy, colW - 28);

      Y += 185;

      // ── SECTION 2: APPOINTMENT DETAILS ─────────────────────────────────────
      rr(MARGIN, Y, INNER, 130, 8, C.bgCard, C.border);
      let ay = sectionTitle('Appointment Details', MARGIN + 14, Y + 14, INNER - 28);

      const detW = (INNER - 56) / 4;
      const detCols = [MARGIN + 14, MARGIN + 14 + detW + 8, MARGIN + 14 + (detW + 8) * 2, MARGIN + 14 + (detW + 8) * 3];

      ay = kv('Date', fmtDate(appt.appointment_date), detCols[0], ay, detW);
      const ay2 = kv('Time Scheduled', appt.appointment_time || 'N/A', detCols[1], ay - 26, detW);
      const ay3 = kv('Time Completed', appt.updatedAt && appt.status === 'completed' ? fmtDateTime(appt.updatedAt) : 'N/A', detCols[2], ay - 26, detW);
      const ay4 = kv('Duration (hrs)',  appt.durationHours ? `${appt.durationHours}h` : 'N/A', detCols[3], ay - 26, detW);

      const rowY2 = Math.max(ay, ay2, ay3, ay4);
      kv('Service', appt.service?.name || (appt.isConcierge ? `Medical Concierge (${appt.conciergeType || 'General'})` : 'General Consultation'), detCols[0], rowY2, detW);

      // Mode badge
      doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text('Visit Mode', detCols[1], rowY2, { width: detW });
      badge(appt.isVirtual ? 'VIRTUAL' : 'PHYSICAL HOME VISIT', detCols[1], rowY2 + 11, C.badgeTealBg, C.badgeTealTxt);

      // Fee breakdown
      doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text('Consultation Fee', detCols[2], rowY2, { width: detW });
      doc.fillColor(C.black).fontSize(9).font('Helvetica-Bold').text(`KES ${appt.fee || 0}`, detCols[2], rowY2 + 10);
      if (appt.transportFee && Number(appt.transportFee) > 0) {
        doc.fillColor(C.muted).fontSize(7).font('Helvetica').text(`+ Transport: KES ${appt.transportFee}`, detCols[2], rowY2 + 22);
      }

      // Distance for physical visits
      if (!appt.isVirtual && appt.latitude && appt.longitude && doctor.latitude && doctor.longitude) {
        const distKm = haversineKm(Number(appt.latitude), Number(appt.longitude), Number(doctor.latitude), Number(doctor.longitude));
        doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text('Distance Covered', detCols[3], rowY2, { width: detW });
        doc.fillColor(C.black).fontSize(9).font('Helvetica-Bold').text(`${distKm.toFixed(1)} km`, detCols[3], rowY2 + 10);
        doc.fillColor(C.muted).fontSize(7).font('Helvetica').text(`Est. travel: ${Math.round(distKm * 3)} min`, detCols[3], rowY2 + 22);
      }

      Y += 140;

      // ── SECTION 3: MEDIC RATING ────────────────────────────────────────────
      if (review) {
        rr(MARGIN, Y, INNER, 60, 8, C.bgCard, C.border);
        let ry = sectionTitle('Patient Rating & Feedback', MARGIN + 14, Y + 14, INNER - 28);
        // Stars
        const starSize = 14;
        let sx = MARGIN + 14;
        for (let i = 1; i <= 5; i++) {
          doc.fillColor(i <= review.rating ? C.starFilled : C.starEmpty)
             .fontSize(starSize).font('Helvetica-Bold').text('★', sx, ry, { lineBreak: false });
          sx += starSize + 2;
        }
        doc.fillColor(C.muted).fontSize(8).font('Helvetica')
           .text(`  ${review.rating}/5 stars`, sx, ry + 2, { lineBreak: false });
        if (review.comment) {
          doc.fillColor(C.black).fontSize(8.5).font('Helvetica-Oblique')
             .text(`"${review.comment}"`, MARGIN + 14, ry + 18, { width: INNER - 28 });
        }
        Y += 70;
      }

      // ── SECTION 4: CLINICAL RECORD ─────────────────────────────────────────
      // Estimate height
      const clinHeight = 180;
      rr(MARGIN, Y, INNER, clinHeight, 8, C.bgCard, C.border);
      let cy = sectionTitle('Clinical Summary & Diagnosis', MARGIN + 14, Y + 14, INNER - 28);

      const halfW = (INNER - 36) / 2;

      // Reason for visit
      doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text('Reason for Visit', MARGIN + 14, cy);
      doc.fillColor(C.black).fontSize(9).font('Helvetica').text(appt.reason || 'Not specified', MARGIN + 14, cy + 10, { width: halfW });

      // Diagnosis
      if (medicalRecords && medicalRecords.length > 0) {
        const rec = medicalRecords[0];
        doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text('Diagnosis', colR, cy);
        doc.fillColor(C.black).fontSize(9).font('Helvetica').text(rec.diagnosis || 'None recorded', colR, cy + 10, { width: halfW });
        cy = Math.max(cy + 30, cy + Math.ceil((rec.diagnosis || '').length / 60) * 12 + 14);

        if (rec.notes) {
          doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text('Clinical Notes', MARGIN + 14, cy);
          doc.fillColor(C.black).fontSize(9).font('Helvetica').text(rec.notes, MARGIN + 14, cy + 10, { width: INNER - 28 });
          cy += Math.ceil(rec.notes.length / 90) * 12 + 20;
        }
      } else {
        cy += 30;
      }

      // Active medications brought by patient
      if (appt.activeMedications) {
        doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text('Active Medications (Patient-Reported)', MARGIN + 14, cy);
        doc.fillColor(C.muted).fontSize(8.5).font('Helvetica').text(appt.activeMedications, MARGIN + 14, cy + 10, { width: INNER - 28 });
        cy += 30;
      }

      Y += clinHeight + 10;

      // ── SECTION 5: PRESCRIPTIONS ───────────────────────────────────────────
      if (prescriptions && prescriptions.length > 0) {
        const presH = 30 + prescriptions.reduce((acc, rx) => acc + 24 + (rx.items?.length || 0) * 18, 0);
        rr(MARGIN, Y, INNER, Math.min(presH + 20, 260), 8, C.bgCard, C.border);
        let py = sectionTitle('Prescriptions Issued', MARGIN + 14, Y + 14, INNER - 28);

        prescriptions.forEach((rx, idx) => {
          const sc2 = statusColors(rx.status);
          doc.fillColor(C.black).fontSize(9).font('Helvetica-Bold')
             .text(`Prescription #${idx + 1}`, MARGIN + 14, py, { continued: true });
          badge(rx.status?.toUpperCase() || 'PENDING', MARGIN + 120, py - 1, sc2.bg, sc2.txt);
          doc.fillColor(C.muted).fontSize(7.5).font('Helvetica')
             .text(`  Issued: ${fmtDate(rx.createdAt)}  |  Valid until: ${fmtDate(rx.validUntil)}`, MARGIN + 14, py + 11, { width: INNER - 28 });
          py += 24;

          if (rx.items && rx.items.length > 0) {
            // Column headers
            doc.fillColor(C.label).fontSize(7).font('Helvetica-Bold')
               .text('MEDICATION', MARGIN + 20, py)
               .text('DOSAGE', MARGIN + 230, py)
               .text('FREQUENCY', MARGIN + 320, py)
               .text('DURATION', MARGIN + 420, py);
            py += 12;

            rx.items.forEach((item: any) => {
              if (py > Y + 230) return;
              // Zebra row
              rr(MARGIN + 14, py - 2, INNER - 28, 16, 3, '#F9FAFB');
              doc.fillColor(C.black).fontSize(8.5).font('Helvetica')
                 .text(item.medicationName || item.medication?.name || '—', MARGIN + 20, py, { width: 200 });
              doc.fillColor(C.muted).fontSize(8.5).font('Helvetica')
                 .text(item.dosage || '—',     MARGIN + 230, py)
                 .text(item.frequency || '—',  MARGIN + 320, py)
                 .text(item.duration || '—',   MARGIN + 420, py);
              py += 18;
            });
          }

          if (rx.notes) {
            doc.fillColor(C.label).fontSize(7.5).font('Helvetica')
               .text(`Notes: `, MARGIN + 20, py, { continued: true });
            doc.fillColor(C.muted).font('Helvetica-Oblique')
               .text(rx.notes, { width: INNER - 40 });
            py += 14;
          }
          py += 6;
        });

        Y += Math.min(presH + 30, 270);
      }

      // ── SECTION 6: LAB ORDERS ──────────────────────────────────────────────
      if (labOrders && labOrders.length > 0) {
        const labH = 30 + labOrders.length * 20;
        rr(MARGIN, Y, INNER, labH + 20, 8, C.bgCard, C.border);
        let ly = sectionTitle('Laboratory Orders', MARGIN + 14, Y + 14, INNER - 28);
        doc.fillColor(C.label).fontSize(7).font('Helvetica-Bold')
           .text('TEST NAME', MARGIN + 20, ly)
           .text('STATUS', MARGIN + 300, ly)
           .text('ORDERED', MARGIN + 400, ly);
        ly += 12;

        labOrders.forEach((order: any) => {
          rr(MARGIN + 14, ly - 2, INNER - 28, 16, 3, '#F9FAFB');
          const lsc = statusColors(order.status);
          doc.fillColor(C.black).fontSize(8.5).font('Helvetica')
             .text(order.test?.name || order.testName || '—', MARGIN + 20, ly, { width: 260 });
          badge((order.status || 'PENDING').toUpperCase(), MARGIN + 300, ly - 1, lsc.bg, lsc.txt);
          doc.fillColor(C.muted).fontSize(8).font('Helvetica')
             .text(fmtDate(order.createdAt), MARGIN + 400, ly);
          ly += 20;
        });

        Y += labH + 30;
      }

      // ── SECTION 7: RECOMMENDATIONS & FOLLOW-UP ────────────────────────────
      const hasRec = medicRecommendations && medicRecommendations.length > 0;
      const hasMedRec = medicalRecords && medicalRecords.length > 0 && medicalRecords[0].prescription;

      if (hasRec || hasMedRec) {
        const recH = 30 + (hasRec ? medicRecommendations.length * 22 : 0) + (hasMedRec ? 40 : 0);
        rr(MARGIN, Y, INNER, Math.max(recH, 90), 8, C.brandLight, C.brand);
        let recY = sectionTitle('Recommendations, Suggestions & Follow-Up', MARGIN + 14, Y + 14, INNER - 28);

        if (hasMedRec) {
          doc.fillColor(C.label).fontSize(7.5).font('Helvetica').text('Doctor\'s Prescription Notes', MARGIN + 14, recY);
          doc.fillColor(C.black).fontSize(9).font('Helvetica').text(medicalRecords[0].prescription, MARGIN + 14, recY + 10, { width: INNER - 28 });
          recY += Math.ceil((medicalRecords[0].prescription || '').length / 90) * 12 + 22;
        }

        if (hasRec) {
          medicRecommendations.forEach((rec: any, i: number) => {
            doc.fillColor(C.brand).fontSize(9).font('Helvetica-Bold')
               .text(`${i + 1}.`, MARGIN + 14, recY, { continued: true });
            doc.fillColor(C.black).font('Helvetica')
               .text(`  ${rec.note || rec.recommendation || rec.text || JSON.stringify(rec)}`, { width: INNER - 40 });
            recY += 22;
          });
        }

        Y += Math.max(recH, 90) + 10;
      }

      // ── SECTION 8: MAP SNAPSHOT ────────────────────────────────────────────
      if (!appt.isVirtual && appt.latitude && appt.longitude) {
        rr(MARGIN, Y, INNER, 220, 8, C.bgCard, C.border);
        let my = sectionTitle('Patient Location Map', MARGIN + 14, Y + 14, INNER - 28);

        // Distance summary
        if (doctor.latitude && doctor.longitude) {
          const dist = haversineKm(Number(appt.latitude), Number(appt.longitude), Number(doctor.latitude), Number(doctor.longitude));
          doc.fillColor(C.muted).fontSize(8).font('Helvetica')
             .text(`Patient coords: ${Number(appt.latitude).toFixed(5)}, ${Number(appt.longitude).toFixed(5)}  •  Approx. distance from medic: ${dist.toFixed(2)} km`,
                   MARGIN + 14, my, { width: INNER - 28 });
          my += 14;
        }

        try {
          const lat = appt.latitude;
          const lon = appt.longitude;
          const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=14&size=700x160&maptype=mapnik&markers=${lat},${lon},red`;
          const res = await fetch(mapUrl, { signal: AbortSignal.timeout(6000) });
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            doc.image(buf, MARGIN + 10, my + 2, { width: INNER - 20, height: 155 });
          } else { throw new Error('map fetch failed'); }
        } catch {
          rr(MARGIN + 10, my + 2, INNER - 20, 155, 6, '#F9FAFB', C.border);
          doc.fillColor(C.muted).fontSize(9).font('Helvetica')
             .text('Map image unavailable. Coordinates recorded above.', MARGIN + 14, my + 70, { width: INNER - 28, align: 'center' });
        }
        Y += 230;
      }

      // ── FOOTER ─────────────────────────────────────────────────────────────
      const FH = 40;
      const footerY = PH - FH;
      rr(0, footerY, PW, FH, 0, C.brand);
      doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica')
         .text('This document is a confidential medical record generated by M-Clinic. For support: support@mclinic.co.ke  |  portal.mclinic.co.ke',
               MARGIN, footerY + 10, { width: PW - MARGIN * 2, align: 'center' });
      doc.fillColor('rgba(255,255,255,0.6)').fontSize(7).font('Helvetica')
         .text(`Document ID: APT-${appt.id}-${Date.now()}  |  ${fmtDateTime(new Date())}`,
               MARGIN, footerY + 22, { width: PW - MARGIN * 2, align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
