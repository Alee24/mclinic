import { useState, useEffect } from 'react';
import { FiUser, FiActivity, FiShield } from 'react-icons/fi';

interface UserAvatarProps {
    user: any;
    className?: string;
    showStatus?: boolean;
}

export default function UserAvatar({ user, className = "w-12 h-12" }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);
    
    // Construct the proxy URL
    const imageUrl = user?.id ? `/api/users/profile-image/${user.id}` : '';

    const isMedic = ['doctor', 'nurse', 'clinician', 'medic'].includes(user?.role?.toLowerCase() || '');
    const isPatient = user?.role?.toLowerCase() === 'patient';
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    if (!user) return <div className={`bg-gray-100 animate-pulse rounded-full ${className}`} />;

    if (imageError || !imageUrl) {
        let gradient = 'from-gray-100 to-gray-200';
        let iconColor = 'text-gray-400';
        let Icon = FiUser;

        if (isPatient) {
            gradient = 'from-blue-500 to-indigo-600';
            iconColor = 'text-white';
        } else if (isMedic) {
            gradient = 'from-emerald-400 to-teal-600';
            iconColor = 'text-white';
        } else if (isAdmin) {
            gradient = 'from-purple-500 to-pink-600';
            iconColor = 'text-white';
            Icon = FiShield;
        }

        return (
            <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-sm overflow-hidden ${className}`}>
                <Icon className={`${iconColor} w-1/2 h-1/2 opacity-80`} />
                {/* Subtle glass effect overlay */}
                <div className="absolute inset-0 bg-white/10" />
            </div>
        );
    }

    return (
        <div className={`relative rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm ${className}`}>
            <img
                src={imageUrl}
                alt={`${user.fname || 'User'} avatar`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={() => setImageError(true)}
                loading="lazy"
            />
        </div>
    );
}
