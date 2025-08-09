"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    X,
    Activity,
    Camera,
    Users,
    User,
} from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-provider'
import logoWhite from "@/assets/logo/logo_white.webp";
import Image from 'next/image'
const navigation = [
    { name: 'Usage Analytics', href: '/usage', icon: Activity },
    { name: 'Hairstyle Data', href: '/data', icon: Camera },
    { name: 'Skin Analysis', href: '/skin-analysis', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
]

export default function SalonLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    return (
        <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-neutral-950 bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
                style={{ backgroundColor: 'var(--sidebar)' }}
            >
                <div className="flex flex-col h-full">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between p-6 border-b border-sidebar-border gap-4">
                        <div className="flex items-center space-x-3">

                            <Image src={logoWhite} alt='TryMyStyle Logo' />

                        </div>
                        <div className="flex items-center space-x-2">
                            <ThemeSwitcher />
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-md text-white hover:text-white hover:bg-white/20"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'bg-white shadow-sm'
                                            : 'text-white hover:bg-white/20 hover:text-white'
                                        }
                                    `}
                                    style={isActive ? { color: 'var(--primary)' } : {}}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-sidebar-border">
                        <button
                            onClick={() => {
                                localStorage.removeItem("access-tmsadmin");
                                localStorage.removeItem("refresh-tmsadmin");
                                window.location.href = "/login";
                            }}
                            className="w-full mb-2 px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
                            style={{ color: 'var(--primary)' }}
                        >
                            Logout
                        </button>
                        <div className="text-xs text-white/80 text-center">
                            © 2024 TryMyStyle
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-background flex-shrink-0">
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
} 