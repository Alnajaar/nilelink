import { useRouter } from 'next/navigation';
import RegisterPage from '@/shared/components/auth/RegisterPage';

export default function DeliveryRegisterPage() {
    const router = useRouter();

    return (
        <RegisterPage
            appName="Fleet Courier"
            onRegisterSuccess={() => router.push('/auth/verify-email')}
        />
    );
}
