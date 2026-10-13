"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, Activity, Camera, FileImage, Users, User, Scissors, ShoppingCart, Menu, Sparkles } from "lucide-react";
import logoWhite from "@/assets/logo/logo_white.webp";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/translations";

const navigation: { key: TranslationKey; href: string; icon: typeof Activity }[] = [
  { key: "nav.dashboard", href: "/usage", icon: Activity },
  { key: "nav.results", href: "/results", icon: FileImage },
  { key: "nav.vtoData", href: "/data", icon: Camera },
  { key: "nav.products", href: "/products", icon: ShoppingCart },
  { key: "nav.services", href: "/services", icon: Sparkles },
  { key: "nav.skinAnalysis", href: "/skin-analysis", icon: Users },
  { key: "nav.hairAnalysis", href: "/hair-analysis", icon: Scissors },
  { key: "nav.profile", href: "/profile", icon: User },
];

export default function SalonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  // Without a token the panel can only show an empty shell, so send the
  // user straight to the login screen.
  useEffect(() => {
    if (!localStorage.getItem("access-tmsadmin")) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) return null;

  return (
    <div className="flex h-dvh max-h-dvh bg-linear-to-br from-neutral-50 to-neutral-100 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-transform duration-300 ease-in-out
                ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
                bg-sidebar text-sidebar-foreground
            `}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border gap-4">
            <div className="flex items-center space-x-3">
              <Image src={logoWhite} alt="TryMyStyle Logo" />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isActive
                      ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }
                                    `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.key)}</span>
                </Link>
              );
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
              className="w-full mb-2 px-4 py-2 rounded-lg text-sm font-medium bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            >
              {t("shell.logout")}
            </button>
            <div className="text-xs text-sidebar-foreground/80 text-center">
              © 2024 TryMyStyle
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {/* Mobile top bar */}
        <header className="flex shrink-0 items-center gap-3 border-b bg-background px-3 py-3 lg:hidden">
          <button
            type="button"
            aria-label={t("shell.openMenu")}
            onClick={() => setSidebarOpen(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-border p-2 text-foreground hover:bg-muted touch-manipulation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="truncate text-sm font-semibold tracking-tight">
            {t("shell.adminTitle")}
          </span>
        </header>

        {/* Page Content */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-x-none px-3 py-4 sm:px-6 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
