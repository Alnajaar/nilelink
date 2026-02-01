'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Users, Package, BarChart3, Settings, LogOut } from 'lucide-react';

const PosLandingPage: React.FC = () => {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading state while mounting or auth is loading
    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-pos-bg-primary flex items-center justify-center">
                <div className="text-pos-text-primary">Loading NileLink POS...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        router.push('/auth/login');
        return null;
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-pos-bg-primary">
            {/* Header */}
            <header className="bg-pos-bg-secondary border-b border-pos-border-primary px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Terminal className="h-8 w-8 text-pos-accent-primary" />
                        <div>
                            <h1 className="text-2xl font-bold text-pos-text-primary">NileLink POS</h1>
                            <p className="text-sm text-pos-text-secondary">Economic OS Terminal</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-pos-text-secondary">
                            {user.email}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="text-pos-text-secondary hover:text-pos-text-primary"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-pos-text-primary mb-2">
                            Welcome to NileLink POS
                        </h2>
                        <p className="text-pos-text-secondary">
                            Institutional-grade commerce terminal. Offline-first ledger sync and cryptographically secured settlement.
                        </p>
                    </div>

                    <Tabs defaultValue="terminal" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-pos-bg-secondary">
                            <TabsTrigger value="terminal" className="data-[state=active]:bg-pos-accent-primary data-[state=active]:text-pos-text-primary">
                                <Terminal className="h-4 w-4 mr-2" />
                                Terminal
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="data-[state=active]:bg-pos-accent-primary data-[state=active]:text-pos-text-primary">
                                <Package className="h-4 w-4 mr-2" />
                                Orders
                            </TabsTrigger>
                            <TabsTrigger value="inventory" className="data-[state=active]:bg-pos-accent-primary data-[state=active]:text-pos-text-primary">
                                <Package className="h-4 w-4 mr-2" />
                                Inventory
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="data-[state=active]:bg-pos-accent-primary data-[state=active]:text-pos-text-primary">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="data-[state=active]:bg-pos-accent-primary data-[state=active]:text-pos-text-primary">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="terminal" className="mt-6">
                            <Card className="bg-pos-bg-secondary border-pos-border-primary">
                                <CardHeader>
                                    <CardTitle className="text-pos-text-primary flex items-center">
                                        <Terminal className="h-5 w-5 mr-2" />
                                        POS Terminal
                                    </CardTitle>
                                    <CardDescription className="text-pos-text-secondary">
                                        Start processing orders with our advanced point-of-sale system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={() => router.push('/terminal')}
                                        className="w-full bg-pos-accent-primary hover:bg-pos-accent-primary/90 text-pos-text-primary"
                                        size="lg"
                                    >
                                        Open Terminal
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orders" className="mt-6">
                            <Card className="bg-pos-bg-secondary border-pos-border-primary">
                                <CardHeader>
                                    <CardTitle className="text-pos-text-primary flex items-center">
                                        <Package className="h-5 w-5 mr-2" />
                                        Order Management
                                    </CardTitle>
                                    <CardDescription className="text-pos-text-secondary">
                                        View and manage all orders in real-time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={() => router.push('/orders')}
                                        variant="outline"
                                        className="w-full border-pos-border-primary text-pos-text-primary hover:bg-pos-bg-primary"
                                        size="lg"
                                    >
                                        Manage Orders
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="inventory" className="mt-6">
                            <Card className="bg-pos-bg-secondary border-pos-border-primary">
                                <CardHeader>
                                    <CardTitle className="text-pos-text-primary flex items-center">
                                        <Package className="h-5 w-5 mr-2" />
                                        Inventory Control
                                    </CardTitle>
                                    <CardDescription className="text-pos-text-secondary">
                                        Manage your product inventory and stock levels
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={() => router.push('/inventory')}
                                        variant="outline"
                                        className="w-full border-pos-border-primary text-pos-text-primary hover:bg-pos-bg-primary"
                                        size="lg"
                                    >
                                        Manage Inventory
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics" className="mt-6">
                            <Card className="bg-pos-bg-secondary border-pos-border-primary">
                                <CardHeader>
                                    <CardTitle className="text-pos-text-primary flex items-center">
                                        <BarChart3 className="h-5 w-5 mr-2" />
                                        Analytics & Reports
                                    </CardTitle>
                                    <CardDescription className="text-pos-text-secondary">
                                        View detailed analytics and generate reports
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={() => router.push('/analytics')}
                                        variant="outline"
                                        className="w-full border-pos-border-primary text-pos-text-primary hover:bg-pos-bg-primary"
                                        size="lg"
                                    >
                                        View Analytics
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="mt-6">
                            <Card className="bg-pos-bg-secondary border-pos-border-primary">
                                <CardHeader>
                                    <CardTitle className="text-pos-text-primary flex items-center">
                                        <Settings className="h-5 w-5 mr-2" />
                                        System Settings
                                    </CardTitle>
                                    <CardDescription className="text-pos-text-secondary">
                                        Configure your POS system settings and preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={() => router.push('/settings')}
                                        variant="outline"
                                        className="w-full border-pos-border-primary text-pos-text-primary hover:bg-pos-bg-primary"
                                        size="lg"
                                    >
                                        Open Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default PosLandingPage;
