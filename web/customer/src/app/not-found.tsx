import Link from 'next/link';
import { Button } from '@shared/components/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h1 className="text-6xl font-black text-primary mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
            </div>
        </div>
    );
}
