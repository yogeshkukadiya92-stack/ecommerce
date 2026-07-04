"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { AuthMode } from "@/types/auth";
import { loginCustomer, logoutCustomer, signupCustomer } from "@/lib/auth/customerAuth";
import { useCustomerSession } from "@/lib/auth/useCustomerSession";
import { Input } from "@/components/ui/Input";

export function AuthFormClient({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { session } = useCustomerSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result =
        mode === "login"
          ? await loginCustomer(email, password)
          : await signupCustomer({ email, fullName, password, phone });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      router.push("/account");
    } catch {
      setError("Unable to connect to account services. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    logoutCustomer();
    setMessage("Logged out successfully.");
  }

  return (
    <main className="container-page py-12">
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-card border border-black/10 bg-white p-6 shadow-card">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">
            {mode === "login" ? "Customer login" : "Create account"}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
            {mode === "login" ? "Welcome back" : "Start your FitSupplement account"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate">
            Sign in to view orders, saved addresses, subscriptions, loyalty points, and faster checkout.
          </p>

          {session ? (
            <div className="mt-5 rounded-md bg-mint p-4">
              <p className="text-sm font-black text-forest">Logged in as {session.email}</p>
              <button className="focus-ring mt-3 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-black text-white" onClick={handleLogout} type="button">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : null}

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <>
                <Input label="Full name" onChange={(event) => setFullName(event.target.value)} required value={fullName} />
                <Input helperText="Used for order updates and delivery coordination." label="Mobile number" onChange={(event) => setPhone(event.target.value)} value={phone} />
              </>
            ) : null}
            <Input label="Email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            <Input label="Password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            {error ? <p className="rounded-md bg-coral/10 p-3 text-sm font-bold text-coral">{error}</p> : null}
            {message ? <p className="rounded-md bg-mint p-3 text-sm font-bold text-forest">{message}</p> : null}
            <button className="focus-ring h-12 rounded-md bg-ink text-sm font-black text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
            {mode === "login" ? (
              <>
                <Link className="text-forest" href="/signup">Create account</Link>
                <Link className="text-slate" href="/forgot-password">Forgot password?</Link>
              </>
            ) : (
              <Link className="text-forest" href="/login">Already have an account?</Link>
            )}
          </div>
        </div>

        <aside className="rounded-card border border-black/10 bg-ink p-6 text-white shadow-card">
          <h2 className="text-2xl font-black tracking-tight">Account benefits</h2>
          <div className="mt-5 grid gap-4 text-sm font-semibold text-white/80">
            <p>Save addresses for faster checkout.</p>
            <p>Track orders, invoices, returns, and delivery updates.</p>
            <p>Manage subscriptions, loyalty, referrals, reviews, and notifications.</p>
            <p>Receive restock, price-drop, and order alerts through your preferred channels.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <main className="container-page py-12">
      <section className="mx-auto max-w-xl rounded-card border border-black/10 bg-white p-6 shadow-card">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Password recovery</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Forgot password</h1>
        <p className="mt-3 text-sm leading-6 text-slate">
          Enter your email and we will prepare a secure password reset request.
        </p>
        <div className="mt-6 grid gap-4">
          <Input label="Email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          <button className="focus-ring h-12 rounded-md bg-ink text-sm font-black text-white" onClick={() => setMessage(`Reset request prepared for ${email || "your email"}.`)} type="button">
            Send reset link
          </button>
          {message ? <p className="rounded-md bg-mint p-3 text-sm font-bold text-forest">{message}</p> : null}
        </div>
      </section>
    </main>
  );
}
