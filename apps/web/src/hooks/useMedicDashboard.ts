import { useContext } from 'react';
import { MedicDashboardProvider } from '@/context/MedicDashboardContext';
// This hook now just wraps the context for backward compatibility
export { useMedicDashboard } from '@/context/MedicDashboardContext';
export type { DashboardStats } from '@/context/MedicDashboardContext';
