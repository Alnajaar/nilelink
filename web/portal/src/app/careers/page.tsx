'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    MapPin, Clock, DollarSign, Users,
    ArrowRight, Building, Code, Shield,
    TrendingUp, Heart, Globe
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Card } from '@shared/components/Card';

const jobOpenings = [
    {
        id: 'senior-blockchain-engineer',
        title: 'Senior Blockchain Engineer',
        department: 'Engineering',
        location: 'Remote / San Francisco',
        type: 'Full-time',
        salary: '$180K - $250K',
        description: 'Lead development of core NileLink Protocol smart contracts and blockchain infrastructure. Work with cutting-edge DeFi and Web3 technologies.',
        requirements: [
            '5+ years blockchain development experience',
            'Solidity, Rust, or similar smart contract languages',
            'Deep understanding of DeFi protocols',
            'Experience with cross-chain technologies'
        ],
        benefits: ['Equity package', 'Health insurance', 'Flexible PTO', 'Home office stipend']
    },
    {
        id: 'security-researcher',
        title: 'Security Researcher',
        department: 'Security',
        location: 'Remote',
        type: 'Full-time',
        salary: '$160K - $220K',
        description: 'Conduct security audits, vulnerability research, and threat modeling for the NileLink Protocol and ecosystem applications.',
        requirements: [
            '3+ years in cybersecurity or smart contract auditing',
            'Experience with blockchain security',
            'Knowledge of cryptography and secure coding',
            'Bug bounty program experience preferred'
        ],
        benefits: ['Top-tier health coverage', 'Security conferences', 'Research budget', 'Flexible hours']
    },
    {
        id: 'product-manager',
        title: 'Product Manager - Commerce Protocol',
        department: 'Product',
        location: 'New York / Remote',
        type: 'Full-time',
        salary: '$140K - $190K',
        description: 'Define product strategy for NileLink\'s decentralized commerce platform. Work closely with engineering, design, and business teams.',
        requirements: [
            '4+ years product management experience',
            'Background in fintech or Web3 preferred',
            'Strong analytical and communication skills',
            'Experience with B2B enterprise products'
        ],
        benefits: ['Equity participation', 'Professional development', 'Team retreats', 'Modern office']
    },
    {
        id: 'devrel-engineer',
        title: 'Developer Relations Engineer',
        department: 'Community',
        location: 'Remote',
        type: 'Full-time',
        salary: '$120K - $170K',
        description: 'Support developers building on NileLink Protocol through documentation, tutorials, and community engagement.',
        requirements: [
            '3+ years developer advocacy or technical writing',
            'Strong coding skills in multiple languages',
            'Experience with API documentation',
            'Community management experience'
        ],
        benefits: ['Conference speaking opportunities', 'Learning stipend', 'Flexible schedule', 'Global travel']
    }
];

const departments = [
    { name: 'Engineering', icon: Code, count: 8 },
    { name: 'Security', icon: Shield, count: 4 },
    { name: 'Product', icon: TrendingUp, count: 3 },
    { name: 'Community', icon: Heart, count: 2 },
    { name: 'Operations', icon: Building, count: 3 },
    { name: 'Design', icon: Globe, count: 2 }
];

export default function CareersPage() {
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

    const filteredJobs = selectedDepartment === 'all'
        ? jobOpenings
        : jobOpenings.filter(job => job.department.toLowerCase() === selectedDepartment);

    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
                                <Code size={24} fill="currentColor" />
                            </div>
                            <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                        </Link>
                        <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest opacity-40">
                            <Link href="/docs" className="hover:opacity-100 transition-opacity">Protocol</Link>
                            <Link href="/status" className="hover:opacity-100 transition-opacity">Network Status</Link>
                            <Link href="/governance" className="hover:opacity-100 transition-opacity">Governance</Link>
                        </div>
                    </div>
                    <Link href="/get-started">
                        <Button className="h-12 px-8 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                            Join Us
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Join Our Mission
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Build the Future<br />of Commerce
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto mb-12">
                        We're looking for exceptional talent to help us democratize enterprise-grade commerce infrastructure for businesses worldwide.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-black uppercase tracking-widest">Actively Hiring</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                            <Users size={16} className="text-primary" />
                            <span className="text-sm font-black uppercase tracking-widest">50+ Team Members</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full">
                            <Globe size={16} className="text-amber-500" />
                            <span className="text-sm font-black uppercase tracking-widest">Remote-First</span>
                        </div>
                    </div>
                </div>

                {/* Departments */}
                <div className="mb-16">
                    <h2 className="text-4xl font-black text-center mb-12">Our Teams</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {departments.map((dept) => (
                            <Card key={dept.name} className="p-6 border-2 border-surface bg-background text-center hover:border-primary transition-all group">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-background transition-all">
                                    <dept.icon size={24} />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">{dept.name}</h3>
                                <p className="text-sm text-text opacity-60">{dept.count} openings</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Job Filter */}
                <div className="mb-12">
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button
                            onClick={() => setSelectedDepartment('all')}
                            variant={selectedDepartment === 'all' ? 'primary' : 'outline'}
                            className="h-12 px-6 font-black uppercase tracking-widest text-sm"
                        >
                            All Departments
                        </Button>
                        {departments.map((dept) => (
                            <Button
                                key={dept.name}
                                onClick={() => setSelectedDepartment(dept.name.toLowerCase())}
                                variant={selectedDepartment === dept.name.toLowerCase() ? 'primary' : 'outline'}
                                className="h-12 px-6 font-black uppercase tracking-widest text-sm"
                            >
                                {dept.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Job Listings */}
                <div className="space-y-8 mb-20">
                    {filteredJobs.map((job) => (
                        <Card key={job.id} className="p-8 border-2 border-surface bg-white hover:border-primary transition-all group">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-4 mb-4">
                                        <Badge className="bg-primary text-background border-0 font-black px-3 py-1 text-[8px] uppercase tracking-widest">
                                            {job.department}
                                        </Badge>
                                        <Badge variant="neutral" className="border-text text-text font-black px-3 py-1 text-[8px] uppercase tracking-widest">
                                            {job.type}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-sm opacity-60">
                                            <MapPin size={14} />
                                            <span>{job.location}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">
                                        {job.title}
                                    </h3>

                                    <p className="text-lg text-text opacity-80 mb-6 leading-relaxed">
                                        {job.description}
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h4 className="font-black uppercase tracking-widest text-sm mb-3">Requirements</h4>
                                            <ul className="space-y-2">
                                                {job.requirements.map((req, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm opacity-70">
                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                                        <span>{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-black uppercase tracking-widest text-sm mb-3">Benefits</h4>
                                            <ul className="space-y-2">
                                                {job.benefits.map((benefit, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm opacity-70">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm opacity-60">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={14} />
                                            <span className="font-mono">{job.salary}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>Full-time</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:flex-shrink-0">
                                    <Link href={`/careers/${job.id}`}>
                                        <Button className="h-14 px-8 bg-text text-background hover:bg-primary hover:text-white font-black uppercase tracking-widest rounded-xl transition-all group-hover:scale-105">
                                            Apply Now
                                            <ArrowRight className="ml-2" size={18} />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Culture Section */}
                <div className="mb-20">
                    <Card className="p-12 border-2 border-text bg-gradient-to-br from-background to-surface">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-text mb-4">
                                Why NileLink?
                            </h2>
                            <p className="text-xl text-text opacity-60 max-w-2xl mx-auto">
                                We're building something extraordinary. Here's what makes working at NileLink special.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Globe,
                                    title: 'Global Impact',
                                    description: 'Your work will touch businesses in every country, democratizing access to enterprise commerce tools.'
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Cutting-Edge Tech',
                                    description: 'Work with the latest in blockchain, DeFi, and distributed systems technology.'
                                },
                                {
                                    icon: Heart,
                                    title: 'Mission-Driven',
                                    description: 'Join a team passionate about building fair, transparent, and accessible financial infrastructure.'
                                }
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <item.icon size={32} className="text-primary" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase mb-3">{item.title}</h3>
                                    <p className="text-text opacity-60 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Card className="p-12 border-2 border-primary bg-primary text-background">
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
                            Don't See Your Role?
                        </h2>
                        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                            We're always looking for exceptional talent. Send us your resume and tell us why you'd be a great fit for NileLink.
                        </p>
                        <Button className="h-16 px-12 bg-background text-primary hover:scale-105 font-black uppercase tracking-widest text-lg rounded-2xl transition-all">
                            Send General Application
                            <ArrowRight className="ml-3" size={20} />
                        </Button>
                    </Card>
                </div>
            </main>
        </div>
    );
}
