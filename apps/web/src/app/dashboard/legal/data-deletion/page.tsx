'use client';

import { useState } from 'react';
import { IoMdTrash, IoMdWarning, IoMdCheckmarkCircle } from 'react-icons/io';

export default function RevokeDataPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = formData.get('email') as string;
        const reason = formData.get('reason') as string;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';
            const res = await fetch(`${API_URL}/legal/data-deletion-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, reason }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to submit request');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <IoMdCheckmarkCircle className="text-3xl" />
                </div>
                <h2 className="!text-2xl !mb-4">Request Submitted</h2>
                <p className="max-w-md mx-auto text-gray-600">
                    Your request for data deletion has been received. Our compliance team will review your request and get back to you within 30 days regarding the status of your data.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    Return to Form
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
                    <IoMdTrash className="text-2xl" />
                </div>
                <div>
                    <h1 className="!mb-1 !text-2xl sm:!text-3xl">Request Data Deletion</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your right to be forgotten</p>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 mb-8">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <IoMdWarning className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-amber-700 dark:text-amber-200 !mb-0">
                            <strong>Warning:</strong> Deleting your data is permanent and cannot be undone. This will remove your account, medical history access, and appointment records from our active systems.
                        </p>
                    </div>
                </div>
            </div>

            <p>
                At M-Clinic, we value your privacy and your right to control your personal data. In accordance with the Data Protection Act of Kenya and other applicable laws, you have the right to request the deletion of your personal information from our systems using the form below.
            </p>

            <h3>What happens when you request deletion?</h3>
            <ul>
                <li><strong>Verification:</strong> We will first verify your identity to ensure the request is legitimate.</li>
                <li><strong>Review:</strong> We will review your data to see if we are legally required to retain any information (e.g., for medical medico-legal reasons).</li>
                <li><strong>Erasure:</strong> Data that is not required by law to be retained will be permanently deleted or anonymized.</li>
                <li><strong>Confirmation:</strong> We will confirm the completion of the process via email.</li>
            </ul>

            <div className="mt-8 not-prose">
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Deletion Request Form</h3>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Account Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition"
                                placeholder="doctor@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Reason for Deletion (Optional)
                            </label>
                            <textarea
                                id="reason"
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition"
                                placeholder="Helping us understand why you are leaving helps us improve."
                            />
                        </div>

                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="confirm"
                                    name="confirm"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="confirm" className="font-medium text-gray-700 dark:text-gray-300">
                                    I understand that this action is irreversible and I will lose access to my account.
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-500/20"
                        >
                            Submit Deletion Request
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                <p>
                    Note: Certain medical records may be retained for a mandatory period as required by the Kenya Medical Practitioners and Dentists Council (KMPDC) regulations, even after your account deletion request is processed. These records will be securely archived and isolated from active processing.
                </p>
            </div>
        </>
    );
}
