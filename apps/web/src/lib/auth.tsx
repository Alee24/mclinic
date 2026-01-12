'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

import { api } from './api';

export enum UserRole {
    PATIENT = 'patient',
    MEDIC = 'medic', // Consolidated role for Doctor, Nurse, Clinician
    ADMIN = 'admin',
    LAB_TECH = 'lab_tech',
    FINANCE = 'finance',
    PHARMACIST = 'pharmacist',
    // Legacy Roles (Keep for backward compatibility during migration)
    DOCTOR = 'doctor',
    NURSE = 'nurse',
    CLINICIAN = 'clinician',
}


export interface User {
    id: number;
    email: string;
    role: UserRole;
    fname?: string;
    lname?: string;
    profilePicture?: string;
    dob?: string;
    mobile?: string;
    address?: string;
    city?: string;
    national_id?: string;
    doctorId?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await api.get('/auth/profile');
            if (res && res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Keep sync
            }
        } catch (e) {
            console.error('Failed to refresh user:', e);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
                // Fetch fresh data in background
                refreshUser();
            } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: User, token: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        router.push('/dashboard');
        refreshUser(); // Ensure we have latest data on login too (though login response is usually fresh)
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
