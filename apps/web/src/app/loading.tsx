'use client';
import SecureLoader from '@/components/SecureLoader';

export default function Loading() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0a0a0a]">
            <SecureLoader />
        </div>
    );
}
