import { redirect } from 'next/navigation';

export default function DoctorRegisterRedirect() {
    redirect('/register/medic');
}
