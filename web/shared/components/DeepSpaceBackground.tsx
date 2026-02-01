import React from 'react';

export const DeepSpaceBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#02050a]">
            {/* Neural Network SVG Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="network-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-blue-500/40" />
                        <path d="M 2 2 L 100 2 M 2 2 L 2 100" stroke="currentColor" strokeWidth="0.5" className="text-blue-500/10" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#network-grid)" />

                {/* Random Connections */}
                <line x1="10%" y1="20%" x2="30%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-blue-500/10 animate-pulse" />
                <line x1="80%" y1="10%" x2="60%" y2="40%" stroke="currentColor" strokeWidth="1" className="text-blue-500/10 animate-pulse" />
                <line x1="40%" y1="80%" x2="20%" y2="60%" stroke="currentColor" strokeWidth="1" className="text-blue-500/10 animate-pulse" />
                <line x1="90%" y1="70%" x2="70%" y2="90%" stroke="currentColor" strokeWidth="1" className="text-blue-500/10 animate-pulse" />
            </svg>

            {/* Ambient Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/5 blur-[180px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[180px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] contrast-150" />
        </div>
    );
};
