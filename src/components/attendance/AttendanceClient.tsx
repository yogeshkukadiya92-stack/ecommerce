"use client";

import { CheckCircle2, Loader2, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

type AttendanceStats = {
  attendanceDate: string;
  todayCount: number;
  totalLeads: number;
};

type AttendanceResponse = {
  data?: AttendanceStats;
  leadMatched?: boolean;
  message?: string;
};

export function AttendanceClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [groupName, setGroupName] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  useEffect(() => {
    void loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await fetch("/api/attendance", { cache: "no-store" });
      const result = (await response.json().catch(() => ({}))) as AttendanceResponse;

      if (response.ok && result.data) {
        setStats(result.data);
      }
    } catch {
      setStats(null);
    }
  }

  async function markAttendance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/attendance", {
        body: JSON.stringify({ groupName, name, note, phone }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => ({}))) as AttendanceResponse;

      if (!response.ok) {
        setError(result.message ?? "Unable to mark attendance.");
        return;
      }

      setMessage(result.leadMatched ? "Attendance marked. Your group details were matched." : "Attendance marked successfully.");
      setName("");
      setPhone("");
      setGroupName("");
      setNote("");
      await loadStats();
    } catch {
      setError("Unable to mark attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-mist px-4 py-8 sm:py-12">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_440px] lg:items-start">
        <div className="rounded-card border border-black/10 bg-ink p-6 text-white shadow-card sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-md bg-lime px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-ink">
            <ShieldCheck className="h-4 w-4" />
            The Complete Health
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Attendance
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
            Enter your mobile number to mark today&apos;s attendance. If your number is already saved in the WhatsApp group list, your details will be matched automatically.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric label="Today" value={stats?.todayCount ?? 0} />
            <Metric label="Saved leads" value={stats?.totalLeads ?? 0} />
            <Metric label="Date" value={stats?.attendanceDate ?? new Date().toISOString().slice(0, 10)} />
          </div>
        </div>

        <form className="rounded-card border border-black/10 bg-white p-5 shadow-card sm:p-6" onSubmit={markAttendance}>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-mint text-forest">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-ink">Mark attendance</h2>
              <p className="text-sm font-semibold text-slate">Mobile number is required.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <Field icon={<Phone className="h-4 w-4" />} label="Mobile number" required value={phone} onChange={setPhone} placeholder="9876543210" />
            <Field icon={<UserRound className="h-4 w-4" />} label="Name" value={name} onChange={setName} placeholder="Your full name" />
            <Field label="Group name" value={groupName} onChange={setGroupName} placeholder="Optional" />
            <label className="block">
              <span className="mb-2 block text-sm font-black text-ink">Note</span>
              <textarea
                className="focus-ring min-h-24 w-full rounded-md border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-ink placeholder:text-slate"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional"
                value={note}
              />
            </label>
          </div>

          {error ? <p className="mt-4 rounded-md bg-coral/10 p-3 text-sm font-black text-coral">{error}</p> : null}
          {message ? <p className="mt-4 rounded-md bg-mint p-3 text-sm font-black text-forest">{message}</p> : null}

          <button className="focus-ring mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-black text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isSubmitting ? "Saving..." : "Submit attendance"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  icon,
  label,
  onChange,
  placeholder,
  required,
  value
}: {
  icon?: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-ink">{label}</span>
      <span className="flex h-12 items-center gap-2 rounded-md border border-black/10 bg-white px-3">
        {icon ? <span className="text-slate">{icon}</span> : null}
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-slate"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          value={value}
        />
      </span>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
