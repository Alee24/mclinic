'use client';

import { AlertCircle, Clock, XCircle, CheckCircle } from 'lucide-react';

interface ApprovalStatusBannerProps {
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    licenseStatus?: 'valid' | 'expiring_soon' | 'expired';
    licenseExpiryDate?: string;
}

export default function ApprovalStatusBanner({
    status,
    rejectionReason,
    licenseStatus,
    licenseExpiryDate,
}: ApprovalStatusBannerProps) {
    // Pending approval banner
    if (status === 'pending') {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                            Account Pending Approval
                        </h3>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                            Your account is currently under review by our admin team. You can update your profile, but other features are restricted until approval.
                        </p>
                        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-md">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                                What you can do now:
                            </p>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 ml-4 list-disc">
                                <li>Complete your profile information</li>
                                <li>Upload required documents</li>
                                <li>Update your license information</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Rejected banner
    if (status === 'rejected') {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
                            Application Rejected
                        </h3>
                        <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                            Unfortunately, your application has been rejected.
                        </p>
                        {rejectionReason && (
                            <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-md mb-3">
                                <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-1">
                                    Reason:
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300">{rejectionReason}</p>
                            </div>
                        )}
                        <p className="text-sm text-red-600 dark:text-red-400">
                            Please contact support at info@kkdes.co.ke for more information.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // License expiring soon warning
    if (licenseStatus === 'expiring_soon' && licenseExpiryDate) {
        const daysRemaining = Math.ceil(
            (new Date(licenseExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400 mt-0.5 mr-3" />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-1">
                            License Expiring Soon
                        </h3>
                        <p className="text-orange-700 dark:text-orange-300 text-sm mb-2">
                            Your medical license expires in <strong>{daysRemaining} days</strong> on{' '}
                            {new Date(licenseExpiryDate).toLocaleDateString()}.
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                            Please renew your license to avoid account deactivation.
                        </p>
                        <a
                            href="/dashboard/profile"
                            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                        >
                            Update License
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // License expired - account deactivated
    if (licenseStatus === 'expired') {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
                            Account Deactivated - License Expired
                        </h3>
                        <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                            Your medical license has expired. Your account has been deactivated.
                        </p>
                        <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-md mb-3">
                            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                                Account Restrictions:
                            </p>
                            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4 list-disc">
                                <li>Cannot accept new appointments</li>
                                <li>Not visible to patients</li>
                                <li>Limited platform access</li>
                            </ul>
                        </div>
                        <a
                            href="/dashboard/profile"
                            className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                        >
                            Upload Renewed License
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
