"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, ExternalLink, LogOut, Menu, Search, ShieldCheck } from "lucide-react";
import { ADMIN_NAVIGATION } from "@/constants/navigation";
import { logoutAdmin } from "@/lib/admin/adminAuth";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { Skeleton } from "@/components/ui/Skeleton";

export function AdminShell({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, session } = useAdminSession();

  function handleLogout() {
    logoutAdmin();
    router.push("/admin/login");
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-mist p-6">
        <Skeleton className="h-[70vh]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist px-4">
        <section className="w-full max-w-lg rounded-card border border-black/10 bg-white p-6 text-center shadow-card">
          <ShieldCheck className="mx-auto h-10 w-10 text-forest" />
          <h1 className="mt-4 text-2xl font-black tracking-tight text-ink">Admin login required</h1>
          <p className="mt-3 text-sm leading-6 text-slate">
            Admin routes are protected by the mock RBAC-ready session guard.
          </p>
          <Link className="focus-ring mt-5 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-black text-white" href="/admin/login">
            Go to admin login
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-black/10 bg-ink p-5 text-white lg:block">
          <Link href="/admin" className="text-lg font-black tracking-tight">
            FitSupplement Admin
          </Link>
          <div className="mt-5 rounded-card bg-white/10 p-3 text-xs leading-5 text-white/70">
            {session.roles.map((role) => role.name).join(", ")} with {session.permissions.length} permissions.
          </div>
          <nav className="mt-6 grid gap-1">
            {ADMIN_NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-bold ${
                  pathname === item.href ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 lg:hidden">
                <Menu className="h-5 w-5 text-ink" />
                <Link className="text-base font-black text-ink" href="/admin">
                  Admin
                </Link>
              </div>
              <div className="hidden h-10 min-w-0 max-w-md flex-1 items-center gap-2 rounded-md border border-black/10 bg-mist px-3 md:flex">
                <Search className="h-4 w-4 text-slate" />
                <span className="text-sm font-medium text-slate">Search orders, SKUs, customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-md bg-mint px-3 py-2 text-xs font-black text-forest sm:flex">
                  <ShieldCheck className="h-4 w-4" /> {session.fullName}
                </span>
                <Link
                  aria-label="Open storefront website"
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-black text-ink"
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">Website</span>
                </Link>
                <button className="focus-ring rounded-md border border-black/10 bg-white p-2 text-slate" type="button">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-xs font-black text-white" onClick={handleLogout} type="button">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-t border-black/10 px-4 py-2 lg:hidden">
              {ADMIN_NAVIGATION.map((item) => (
                <Link className="shrink-0 rounded-md bg-mist px-3 py-2 text-xs font-black text-ink" href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">
                  Admin control center
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">{title}</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex items-center gap-2 rounded-md bg-forest px-4 py-2 text-sm font-bold text-white shadow-sm"
                >
                  <ExternalLink className="h-4 w-4" /> Open website
                </Link>
                <Link
                  href="/api/admin/overview"
                  className="focus-ring rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm"
                >
                  API overview
                </Link>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
