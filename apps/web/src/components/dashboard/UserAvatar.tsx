import { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/auth';
import { FiUser, FiActivity, FiShield } from 'react-icons/fi';

interface UserAvatarProps {
    user: any;
    className?: string;
    showStatus?: boolean;
}

export default function UserAvatar({ user, className = "w-full h-full object-cover" }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        if (user?.profilePicture) {
            if (user.profilePicture.startsWith('http')) {
                setImageUrl(user.profilePicture);
            } else {
                // Use relative path for web, handle potential double /api if baseUrl already has it
                setImageUrl(`/api/uploads/profiles/${user.profilePicture}`);
            }
            setImageError(false);
        } else {
            setImageUrl('');
        }
    }, [user?.profilePicture]);

    const isMedic = ['doctor', 'nurse', 'clinician', 'medic'].includes(user?.role?.toLowerCase() || '');
    const isPatient = user?.role?.toLowerCase() === 'patient';
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    if (!user) return <div className={`bg-gray-200 animate-pulse ${className}`} />;

    if ((!imageUrl || imageError)) {
        let bgColor = 'bg-gray-200';
        let icon = <FiUser className="text-gray-500" />;

        if (isPatient) {
            bgColor = 'bg-blue-100 dark:bg-blue-900/30';
            icon = <FiUser className="text-blue-600 dark:text-blue-400" />;
        } else if (isMedic) {
            bgColor = 'bg-green-100 dark:bg-green-900/30';
            icon = <FiActivity className="text-green-600 dark:text-green-400" />;
        } else if (isAdmin) {
            bgColor = 'bg-purple-100 dark:bg-purple-900/30';
            icon = <FiShield className="text-purple-600 dark:text-purple-400" />;
        }

        return (
            <div className={`${bgColor} flex items-center justify-center ${className} overflow-hidden`}>
                <div className="text-2xl font-bold">
                    {icon}
                </div>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={`${user.fname} ${user.lname}`}
            className={className}
            onError={() => setImageError(true)}
        />
    );
}
