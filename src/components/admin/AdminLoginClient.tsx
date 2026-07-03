"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { AdminSession } from "@/types/admin";
import { adminRoles, persistAdminSession } from "@/lib/admin/adminAuth";
import { Input } from "@/components/ui/Input";

type LoginResponse = {
  message?: string;
  session?: AdminSession;
};

export function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok || !result.session) {
        setError(result.message ?? "Unable to login.");
        setMessage("");
        return;
      }

      persistAdminSession(result.session);
      setError("");
      setMessage(result.message ?? "Admin login successful.");
      router.push("/admin");
    } catch {
      setError("Unable to login. Check the admin configuration and try again.");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 py-10">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-card border border-black/10 bg-white p-6 shadow-card">
          <ShieldCheck className="h-10 w-10 text-forest" />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.12em] text-forest">Admin authentication</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Login to control catalog</h1>
          <p className="mt-3 text-sm leading-6 text-slate">
            Sign in with the store owner credentials configured for this deployment.
          </p>
          <form autoComplete="off" className="mt-6 grid gap-4" onSubmit={handleLogin}>
            <Input autoComplete="off" label="Admin email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            <Input autoComplete="new-password" label="Password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            {error ? <p className="rounded-md bg-coral/10 p-3 text-sm font-bold text-coral">{error}</p> : null}
            {message ? <p className="rounded-md bg-mint p-3 text-sm font-bold text-forest">{message}</p> : null}
            <button className="focus-ring h-12 rounded-md bg-ink text-sm font-semibold text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
        <aside className="rounded-card border border-black/10 bg-ink p-6 text-white shadow-card">
          <h2 className="text-2xl font-extrabold tracking-tight">Permission-ready roles</h2>
          <div className="mt-5 grid gap-4">
            {adminRoles.map((role) => (
              <div className="rounded-md bg-white/10 p-4" key={role.id}>
                <p className="font-extrabold">{role.name}</p>
                <p className="mt-1 text-sm leading-6 text-white/70">{role.description}</p>
                <p className="mt-2 text-xs font-bold text-lime">{role.permissions.length} permissions</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
