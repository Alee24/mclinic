'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { FiFileText, FiActivity, FiUser, FiCalendar, FiExternalLink, FiDownload, FiInfo, FiShoppingCart, FiDroplet } from 'react-icons/fi';
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
    labOrder?: any;
    pharmacyOrder?: any;
    type: 'APPOINTMENT_ONLY' | 'FULL_RECORD' | 'PRESCRIPTION_ONLY' | 'NOTE_ONLY' | 'LAB_ORDER' | 'PHARMACY_ORDER';
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
                const [appointsRes, recordsRes, scriptsRes, labRes, pharmRes] = await Promise.allSettled([
                    api.get(`/appointments/patient/${user.id}`),
                    api.get(`/medical-records/patient/${user.id}`),
                    api.get(`/pharmacy/prescriptions/patient/${user.id}`),
                    api.get(`/laboratory/orders`),
                    api.get(`/pharmacy/orders/user/${user.id}`)
                ]);

                // Extract or default to empty arrays
                const appointments = appointsRes.status === 'fulfilled' && appointsRes.value?.ok ? await appointsRes.value.json() : [];
                const records = recordsRes.status === 'fulfilled' && recordsRes.value?.ok ? await recordsRes.value.json() : [];
                const prescriptions = scriptsRes.status === 'fulfilled' && scriptsRes.value?.ok ? await scriptsRes.value.json() : [];
                const labOrders = labRes.status === 'fulfilled' && labRes.value?.ok ? await labRes.value.json() : [];
                const pharmOrders = pharmRes.status === 'fulfilled' && pharmRes.value?.ok ? await pharmRes.value.json() : [];

                console.log('Fetched Data:', { appointments, records, prescriptions, labOrders, pharmOrders });

                // --- MERGE LOGIC ---
                const merged = new Map<number | string, UnifiedRecord>();

                // 1. Base on Appointments (The "Skeleton")
                appointments.forEach((apt: any) => {
                    if (!apt.id) return;
                    merged.set(Number(apt.id), {
                        id: `apt-${apt.id}`,
                        date: new Date(apt.appointment_date),
                        appointment: apt,
                        type: 'APPOINTMENT_ONLY'
                    });
                });

                // 2. Attach Medical Records
                records.forEach((rec: any) => {
                    const aptId = rec.appointmentId || rec.appointment?.id;
                    if (aptId && merged.has(Number(aptId))) {
                        const existing = merged.get(Number(aptId))!;
                        existing.medicalRecord = rec;
                        existing.type = 'FULL_RECORD';
                    } else {
                        // Orphan record (or no appointment link) -> Create independent item
                        const recDate = new Date(rec.createdAt);
                        merged.set(`rec-${rec.id}`, {
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
                    if (aptId && merged.has(Number(aptId))) {
                        const existing = merged.get(Number(aptId))!;
                        existing.prescription = script;
                        if (existing.type === 'APPOINTMENT_ONLY') existing.type = 'PRESCRIPTION_ONLY'; // Upgrade status
                    } else {
                        // Orphan prescription
                        merged.set(`script-${script.id}`, {
                            id: `script-${script.id}`,
                            date: new Date(script.createdAt),
                            prescription: script,
                            appointment: script.appointment,
                            type: 'PRESCRIPTION_ONLY'
                        });
                    }
                });

                // 4. Attach Lab Orders
                labOrders.forEach((lab: any) => {
                    const aptId = lab.appointment_id || lab.appointmentId;
                    if (aptId && merged.has(Number(aptId))) {
                        const existing = merged.get(Number(aptId))!;
                        existing.labOrder = lab;
                        if (existing.type === 'APPOINTMENT_ONLY') {
                            existing.type = 'FULL_RECORD';
                        }
                    } else {
                        merged.set(`lab-${lab.id}`, {
                            id: `lab-${lab.id}`,
                            date: new Date(lab.createdAt),
                            labOrder: lab,
                            type: 'LAB_ORDER'
                        });
                    }
                });

                // 5. Attach Pharmacy Orders
                pharmOrders.forEach((pharm: any) => {
                    merged.set(`pharm-${pharm.id}`, {
                        id: `pharm-${pharm.id}`,
                        date: new Date(pharm.createdAt),
                        pharmacyOrder: pharm,
                        type: 'PHARMACY_ORDER'
                    });
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
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://portal.mclinic.co.ke';
            const verificationUrl = `${origin}/verify?id=${serialNumber}`;

            // --- Load Assets ---
            const logoData = await getDataUrl('https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png').catch(() => null);
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
            doc.text('support@mclinic.co.ke | 0700 448 448', 20, 36);

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
            const displayLink = origin.replace(/^https?:\/\//, '');
            doc.textWithLink(displayLink + '/verify', 20, bottomY + 17, { url: verificationUrl });

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
                            {item.type === 'FULL_RECORD' ? <FiActivity className="text-white w-4 h-4" /> :
                                item.type === 'PRESCRIPTION_ONLY' ? <FiFileText className="text-white w-4 h-4" /> :
                                    item.type === 'LAB_ORDER' ? <FiDroplet className="text-white w-4 h-4" /> :
                                        item.type === 'PHARMACY_ORDER' ? <FiShoppingCart className="text-white w-4 h-4" /> :
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
                                        {item.type === 'LAB_ORDER' ? `Lab Test: ${item.labOrder?.test?.name}` :
                                         item.type === 'PHARMACY_ORDER' ? 'Pharmacy Purchase' :
                                         item.medicalRecord?.diagnosis || item.appointment?.service?.name || item.appointment?.service || 'General Consultation'}
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
                                        {item.type === 'FULL_RECORD' ? 'Record' : item.type === 'PRESCRIPTION_ONLY' ? 'Prescription' : item.type === 'LAB_ORDER' ? 'Lab Test' : item.type === 'PHARMACY_ORDER' ? 'Pharmacy' : 'Appointment'}
                                    </div>
                                </div>
                            </div>

                            {/* Doctor info (skip for pharmacy purchases which are self-checkout) */}
                            {item.type !== 'PHARMACY_ORDER' && (
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
                            )}

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

                            {/* Lab Order Section (Nested inside appointment) */}
                            {item.labOrder && item.type !== 'LAB_ORDER' && (
                                <div className="mt-4 border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-purple-500 uppercase flex items-center gap-2">
                                            <FiDroplet /> Prescribed Lab Test: {item.labOrder.test?.name}
                                        </h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                            item.labOrder.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-300' :
                                            item.labOrder.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300' :
                                            item.labOrder.status === 'sample_received' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-300' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                            {item.labOrder.status}
                                        </span>
                                    </div>
                                    <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-3 space-y-2">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span> {item.labOrder.test?.category || 'General Laboratory'}
                                        </div>
                                        {item.labOrder.notes && (
                                            <div className="text-xs text-gray-500 italic">
                                                Instructions: "{item.labOrder.notes}"
                                            </div>
                                        )}
                                        {item.labOrder.sample_collection_date && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300">Preferred Date:</span> {new Date(item.labOrder.sample_collection_date).toLocaleDateString()}
                                            </div>
                                        )}
                                        {item.labOrder.results?.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-purple-100 dark:border-purple-950 space-y-1.5">
                                                <p className="text-[10px] font-black text-purple-650 dark:text-purple-400 uppercase">Results:</p>
                                                {item.labOrder.results.map((res: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-xs">
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{res.parameter_name}</span>
                                                        <span className="text-gray-900 dark:text-white font-bold">{res.value} <span className="text-xs text-gray-500 font-normal">{res.unit}</span></span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {item.labOrder.report_url && (
                                            <div className="pt-2">
                                                <a
                                                    href={`/api/uploads/reports/${item.labOrder.report_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition"
                                                >
                                                    <FiFileText size={10} /> View Lab Report / Results
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Fallback if Appointment only */}
                            {item.type === 'APPOINTMENT_ONLY' && (
                                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 text-xs rounded-xl flex gap-2 items-center">
                                    <FiInfo className="shrink-0" />
                                    <span>No detailed notes or prescriptions recorded for this visit yet.</span>
                                </div>
                            )}

                            {/* Lab Order Details */}
                            {item.type === 'LAB_ORDER' && (
                                <div className="mt-4 border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-purple-500 uppercase flex items-center gap-2">
                                            <FiDroplet /> Lab Results
                                        </h4>
                                        <span className={`text-xs font-bold px-2 py-1 rounded border ${item.labOrder?.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                            {item.labOrder?.status}
                                        </span>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-3 space-y-2">
                                        {item.labOrder?.results?.length > 0 ? (
                                            item.labOrder.results.map((res: any, i: number) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{res.parameter_name}</span>
                                                    <span className="text-gray-900 dark:text-white font-bold">{res.value} <span className="text-xs text-gray-500 font-normal">{res.unit}</span></span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500 italic">Results pending or not uploaded yet.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Pharmacy Order Details */}
                            {item.type === 'PHARMACY_ORDER' && (
                                <div className="mt-4 border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-teal-500 uppercase flex items-center gap-2">
                                            <FiShoppingCart /> Items Purchased
                                        </h4>
                                        <span className={`text-xs font-bold px-2 py-1 rounded border ${item.pharmacyOrder?.status === 'COMPLETED' || item.pharmacyOrder?.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                            {item.pharmacyOrder?.status}
                                        </span>
                                    </div>
                                    <div className="bg-teal-50 dark:bg-teal-900/10 rounded-xl p-3 space-y-2">
                                        {item.pharmacyOrder?.items?.map((pItem: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{pItem.medication?.name || 'Unknown Item'}</span>
                                                <span className="text-gray-500 text-xs">Qty: {pItem.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-right">
                                        <span className="text-xs text-gray-500">Total: </span>
                                        <span className="text-sm font-bold text-teal-700 dark:text-teal-400">KES {item.pharmacyOrder?.total_amount}</span>
                                    </div>
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
        case 'LAB_ORDER': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300';
        case 'PHARMACY_ORDER': return 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-300';
        default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:border-gray-700 dark:text-gray-400';
    }
}
