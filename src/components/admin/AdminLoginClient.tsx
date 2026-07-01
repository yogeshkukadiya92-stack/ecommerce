"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { adminRoles, loginAdmin } from "@/lib/admin/adminAuth";
import { Input } from "@/components/ui/Input";

export function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = loginAdmin(email, password);

    if (!result.ok) {
      setError(result.message);
      setMessage("");
      return;
    }

    setError("");
    setMessage(result.message);
    router.push("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 py-10">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-card border border-black/10 bg-white p-6 shadow-card">
          <ShieldCheck className="h-10 w-10 text-forest" />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.12em] text-forest">Admin authentication</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Login to control catalog</h1>
          <p className="mt-3 text-sm leading-6 text-slate">
            Admin access uses a local session, role list, permission set, and audit logging helper for this environment.
          </p>
          <form autoComplete="off" className="mt-6 grid gap-4" onSubmit={handleLogin}>
            <Input autoComplete="off" label="Admin email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            <Input autoComplete="new-password" label="Password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            {error ? <p className="rounded-md bg-coral/10 p-3 text-sm font-bold text-coral">{error}</p> : null}
            {message ? <p className="rounded-md bg-mint p-3 text-sm font-bold text-forest">{message}</p> : null}
            <button className="focus-ring h-12 rounded-md bg-ink text-sm font-semibold text-white" type="submit">
              Login
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
