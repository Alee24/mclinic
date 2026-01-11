import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';

interface UserAvatarProps {
    user: User;
    className?: string;
    showStatus?: boolean; // Optional: to show online status dot if we had that info
}

export default function UserAvatar({ user, className = "w-full h-full object-cover" }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        if (user?.profilePicture) {
            // Check if it's already a full URL (unlikely but good practice) 
            // or construct it from API
            if (user.profilePicture.startsWith('http')) {
                setImageUrl(user.profilePicture);
            } else {
                setImageUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434'}/uploads/profiles/${user.profilePicture}`);
            }
            setImageError(false);
        } else {
            setImageUrl('');
        }
    }, [user?.profilePicture]);

    const fallbackUrl = `https://ui-avatars.com/api/?name=${user?.fname}+${user?.lname || user?.role}&background=random&color=fff&size=256`;

    if (!user) return <div className={`bg-gray-200 animate-pulse ${className}`} />;

    return (
        <img
            src={(imageUrl && !imageError) ? imageUrl : fallbackUrl}
            alt={`${user.fname} ${user.lname}`}
            className={className}
            onError={() => setImageError(true)}
        />
    );
}
