import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline",
  description: "Offline fallback placeholder for the FitSupplement Store PWA."
};

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 text-center">
      <section className="max-w-md rounded-card border border-black/10 bg-white p-6 shadow-card">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">PWA placeholder</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink">You are offline</h1>
        <p className="mt-3 text-sm leading-6 text-slate">
          Cached pages and offline cart recovery can be enabled when a service worker is connected.
        </p>
        <Link className="focus-ring mt-5 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-black text-white" href="/">
          Try homepage
        </Link>
      </section>
    </main>
  );
}
