'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { FiFileText, FiActivity, FiUser, FiCalendar, FiExternalLink, FiDownload, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface UnifiedRecord {
    id: string; // unique key
    date: Date;
    appointment?: any;
    medicalRecord?: any;
    prescription?: any;
    type: 'APPOINTMENT_ONLY' | 'FULL_RECORD' | 'PRESCRIPTION_ONLY' | 'NOTE_ONLY';
}

export default function MedicalRecordsPage() {
    const { user } = useAuth();
    const [timeline, setTimeline] = useState<UnifiedRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch all related streams in parallel
                const [appointsRes, recordsRes, scriptsRes] = await Promise.allSettled([
                    api.get(`/appointments/patient/${user.id}`),
                    api.get(`/medical-records/patient/${user.id}`),
                    api.get(`/pharmacy/prescriptions/patient/${user.id}`)
                ]);

                // Extract or default to empty arrays
                const appointments = appointsRes.status === 'fulfilled' && appointsRes.value?.ok ? await appointsRes.value.json() : [];
                const records = recordsRes.status === 'fulfilled' && recordsRes.value?.ok ? await recordsRes.value.json() : [];
                const prescriptions = scriptsRes.status === 'fulfilled' && scriptsRes.value?.ok ? await scriptsRes.value.json() : [];

                console.log('Fetched Data:', { appointments, records, prescriptions });

                // --- MERGE LOGIC ---
                const merged = new Map<number, UnifiedRecord>();

                // 1. Base on Appointments (The "Skeleton")
                appointments.forEach((apt: any) => {
                    if (!apt.id) return;
                    merged.set(apt.id, {
                        id: `apt-${apt.id}`,
                        date: new Date(apt.appointment_date),
                        appointment: apt,
                        type: 'APPOINTMENT_ONLY'
                    });
                });

                // 2. Attach Medical Records
                records.forEach((rec: any) => {
                    const aptId = rec.appointmentId || rec.appointment?.id;
                    if (aptId && merged.has(aptId)) {
                        const existing = merged.get(aptId)!;
                        existing.medicalRecord = rec;
                        existing.type = 'FULL_RECORD';
                    } else {
                        // Orphan record (or no appointment link) -> Create independent item
                        const recDate = new Date(rec.createdAt);
                        merged.set(-rec.id, { // Negative ID to avoid collision or unique string
                            id: `rec-${rec.id}`,
                            date: recDate,
                            medicalRecord: rec,
                            appointment: rec.appointment, // Link if it exists in record but not in fetched appointments
                            type: 'NOTE_ONLY'
                        });
                    }
                });

                // 3. Attach Prescriptions
                prescriptions.forEach((script: any) => {
                    const aptId = script.appointmentId || script.appointment?.id;
                    if (aptId && merged.has(aptId)) {
                        const existing = merged.get(aptId)!;
                        existing.prescription = script;
                        if (existing.type === 'APPOINTMENT_ONLY') existing.type = 'PRESCRIPTION_ONLY'; // Upgrade status
                    } else {
                        // Orphan prescription
                        merged.set(-(script.id + 10000), {
                            id: `script-${script.id}`,
                            date: new Date(script.createdAt),
                            prescription: script,
                            appointment: script.appointment,
                            type: 'PRESCRIPTION_ONLY'
                        });
                    }
                });

                // Convert Map to Array & Sort DESC
                const sorted = Array.from(merged.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
                setTimeline(sorted);

            } catch (err) {
                console.error(err);
                toast.error('Could not load entire medical history.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user]);

    const generatePDF = async (item: UnifiedRecord) => {
        const toastId = toast.loading('Generating secure PDF...');
        try {
            const doc = new jsPDF();
            const prescription = item.prescription;
            const serialNumber = `RX-${prescription.id}-${new Date(item.date).getFullYear()}${new Date(item.date).getMonth() + 1}`;
            const verificationUrl = `https://www.mclinic.co.ke/verify?id=${serialNumber}`;

            // --- Load Assets ---
            const logoData = await getDataUrl('/logo.png').catch(() => null);
            const qrData = await QRCode.toDataURL(verificationUrl);

            // --- Header Section ---
            // Logo (Top Right)
            if (logoData) {
                doc.addImage(logoData, 'PNG', 150, 10, 40, 15);
            } else {
                // Fallback text if logo fails
                doc.setFontSize(22);
                doc.setTextColor(41, 128, 185);
                doc.text('M-Clinic', 150, 20, { align: 'right' });
            }

            // Clinic Details (Top Left)
            doc.setFontSize(16);
            doc.setTextColor(41, 128, 185);
            doc.setFont('helvetica', 'bold');
            doc.text('M-Clinic Health', 20, 20);

            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.setFont('helvetica', 'normal');
            doc.text('Virtual Healthcare Services', 20, 26);
            doc.text('Nairobi, Kenya', 20, 31);
            doc.text('support@mclinic.co.ke | +254 700 000 000', 20, 36);

            // Horizontal Line
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(20, 45, 190, 45);

            // --- Prescription Details ---
            doc.setFontSize(10);
            doc.setTextColor(0);

            // Left Column: Patient
            doc.setFont('helvetica', 'bold');
            doc.text('PATIENT DETAILS', 20, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${user?.fname} ${user?.lname}`, 20, 62);
            doc.text(`Date of Visit: ${item.date.toLocaleDateString()}`, 20, 68);

            // Right Column: Serial & ID
            doc.setFont('helvetica', 'bold');
            doc.text('PRESCRIPTION DETAILS', 120, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`Serial No: ${serialNumber}`, 120, 62);
            doc.text(`Internal Ref: #${prescription.id}`, 120, 68);

            // --- Medication Table ---
            const tableColumn = ["Medication", "Dosage", "Frequency", "Duration", "Qty", "Instructions"];
            const tableRows = prescription.items.map((med: any) => [
                med.medicationName || med.medication?.name,
                med.dosage,
                med.frequency,
                med.duration,
                med.quantity,
                med.instructions
            ]);

            autoTable(doc, {
                startY: 80,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3, textColor: 50 },
                alternateRowStyles: { fillColor: [245, 247, 250] }
            });

            // --- Signatures & Footer ---
            // @ts-ignore
            let finalY = doc.lastAutoTable.finalY || 150;

            // Ensure space for footer
            if (finalY > 200) {
                doc.addPage();
                finalY = 20;
            }

            // Doctor Section
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text('Prescribed By:', 20, finalY + 20);

            // Auth Images
            try {
                if (prescription.doctorSignatureUrl) {
                    const sigData = await getDataUrl(prescription.doctorSignatureUrl);
                    doc.addImage(sigData, 'PNG', 20, finalY + 25, 40, 20);
                }
                if (prescription.doctorStampUrl) {
                    const stampData = await getDataUrl(prescription.doctorStampUrl);
                    // Moved stamp to the right to avoid overlapping with signature
                    doc.addImage(stampData, 'PNG', 80, finalY + 15, 35, 35);
                }
            } catch (e) { console.error(e); }

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(getDoctorName(item), 20, finalY + 55);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100);
            doc.text('Licensed Medical Practitioner', 20, finalY + 60);

            // --- Verification Section (Bottom) ---
            const bottomY = 250;
            doc.setDrawColor(200);
            doc.line(20, bottomY - 5, 190, bottomY - 5);

            // QR Code
            doc.addImage(qrData, 'PNG', 160, bottomY, 25, 25);

            // Verification Text
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(41, 128, 185);
            doc.text('VERIFY THIS PRESCRIPTION', 20, bottomY + 5);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(50);
            doc.text('Scan the QR code or visit:', 20, bottomY + 12);
            doc.setTextColor(0, 0, 255);
            doc.textWithLink('www.mclinic.co.ke/verify', 20, bottomY + 17, { url: verificationUrl });

            doc.setTextColor(50);
            doc.text(`Enter Serial Number: ${serialNumber}`, 20, bottomY + 25);

            // Disclaimer
            doc.setFontSize(7);
            doc.setTextColor(150);
            doc.text('This document is electronically generated and valid without a physical signature. Any alteration invalidates this document.', 105, 290, { align: 'center' });

            doc.save(`Prescription_${serialNumber}.pdf`);
            toast.success('Secure Prescription downloaded!', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate PDF', { id: toastId });
        }
    };

    // Helper to fetch image as data URL
    const getDataUrl = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = url;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
        });
    };


    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white tracking-tight">Patient Records</h1>
                    <p className="text-gray-500 mt-1 max-w-lg">
                        Access comprehensive patient history properly from M-Clinic Kenya archives.
                    </p>
                </div>
                {!loading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-bold">{timeline.length} Records</span>
                    </div>
                )}
            </div>

            {/* Loading Skeleton */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && timeline.length === 0 && (
                <div className="text-center py-24 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    {/* @ts-ignore */}
                    <FiFileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Records Found</h3>
                    <p className="text-gray-500">You haven't had any appointments or records created yet.</p>
                </div>
            )}

            {/* Timeline View */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent dark:before:via-gray-800">
                {timeline.map((item) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                        {/* Dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#121212] bg-gray-200 dark:bg-gray-800 group-hover:bg-primary group-hover:scale-110 transition shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                            {/* @ts-ignore */}
                            {item.type === 'FULL_RECORD' ? <FiActivity className="text-white w-4 h-4" /> :
                                // @ts-ignore
                                item.type === 'PRESCRIPTION_ONLY' ? <FiFileText className="text-white w-4 h-4" /> :
                                    // @ts-ignore
                                    <FiCalendar className="text-gray-500 group-hover:text-white w-4 h-4" />}
                        </div>

                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300">

                            {/* Header: Date & Type */}
                            {/* Header: Date & Type & Status */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <time className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                            <FiCalendar />
                                            {item.date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </time>
                                        {item.appointment?.appointment_time && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.appointment.appointment_time}</span>
                                            </>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg dark:text-white">
                                        {item.medicalRecord?.diagnosis || item.appointment?.service?.name || item.appointment?.service || 'General Consultation'}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.appointment?.status && (
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase border ${item.appointment.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                            item.appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                            {item.appointment.status}
                                        </span>
                                    )}
                                    <div className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(item.type)}`}>
                                        {item.type === 'FULL_RECORD' ? 'Record' : item.type === 'PRESCRIPTION_ONLY' ? 'Prescription' : 'Appointment'}
                                    </div>
                                </div>
                            </div>

                            {/* Doctor info */}
                            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                                    <FiUser />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Attended By</p>
                                    <p className="font-bold text-sm dark:text-gray-200">
                                        {getDoctorName(item)}
                                    </p>
                                </div>
                            </div>

                            {/* Medical Notes */}
                            {item.medicalRecord?.notes && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 italic">" {item.medicalRecord.notes} "</p>
                                </div>
                            )}

                            {/* Prescription Section */}
                            {item.prescription && (
                                <div className="mt-4 border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-blue-500 uppercase flex items-center gap-2">
                                            <FiFileText /> Prescribed Meds
                                        </h4>
                                        <button
                                            onClick={() => generatePDF(item)}
                                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1"
                                        >
                                            <FiDownload /> Download PDF
                                        </button>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 space-y-2">
                                        {item.prescription.items?.map((med: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{med.medicationName || med.medication?.name}</span>
                                                <span className="text-gray-500 text-xs">{med.dosage} · {med.frequency}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {(item.prescription.doctorSignatureUrl || item.prescription.doctorStampUrl) && (
                                        <div className="flex gap-4 mt-3 justify-end opacity-70">
                                            {item.prescription.doctorStampUrl && (
                                                <img src={item.prescription.doctorStampUrl} className="h-10 rotate-[-10deg] mix-blend-multiply dark:mix-blend-screen" alt="Stamp" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fallback if Appointment only */}
                            {item.type === 'APPOINTMENT_ONLY' && (
                                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 text-xs rounded-xl flex gap-2 items-center">
                                    {/* @ts-ignore */}
                                    <FiInfo className="shrink-0" />
                                    <span>No detailed notes or prescriptions recorded for this visit yet.</span>
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getDoctorName(item: UnifiedRecord) {
    const doc = item.appointment?.doctor || item.medicalRecord?.doctor || item.prescription?.doctor;
    if (!doc) return 'Unknown Doctor';

    // Check direct fields first (Schema v2), then user relation (Schema v1)
    if (doc.fname && doc.lname) return `Dr. ${doc.fname} ${doc.lname}`;
    if (doc.user?.fname && doc.user?.lname) return `Dr. ${doc.user.fname} ${doc.user.lname}`;

    return 'Medical Professional';
}

function getStatusColor(type: string) {
    switch (type) {
        case 'FULL_RECORD': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300';
        case 'PRESCRIPTION_ONLY': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
        default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:border-gray-700 dark:text-gray-400';
    }
}
