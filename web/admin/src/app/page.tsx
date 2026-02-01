import { redirect } from 'next/navigation';

export default function RootPage() {
    // Redirect to the dashboard by default
    redirect('/dashboard');
}
