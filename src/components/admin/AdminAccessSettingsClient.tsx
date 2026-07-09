"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { persistAdminSession } from "@/lib/admin/adminAuth";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import type { AdminSession } from "@/types/admin";
import { AdminCard } from "@/components/admin/AdminCard";
import { PasswordInput } from "@/components/admin/PasswordInput";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type AccessResponse = {
  admins?: Array<{
    email: string;
    fullName: string;
    id: string;
    lastLoginAt: string | null;
    roles: string[];
  }>;
  message?: string;
  roles?: Array<{
    description: string;
    name: string;
    permissions: number;
  }>;
  session?: AdminSession;
};

export function AdminAccessSettingsClient() {
  const { isReady, session } = useAdminSession();
  const [admins, setAdmins] = useState<AccessResponse["admins"]>([]);
  const [roles, setRoles] = useState<NonNullable<AccessResponse["roles"]>>([]);
  const [loadMessage, setLoadMessage] = useState("");
  const [changeMessage, setChangeMessage] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [changeError, setChangeError] = useState("");
  const [createError, setCreateError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [changeForm, setChangeForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [createForm, setCreateForm] = useState({
    email: "",
    fullName: "",
    password: "",
    roleName: "Admin"
  });

  const canManageAdmins = useMemo(
    () =>
      Boolean(
        session?.permissions.includes("user:manage") ||
          session?.permissions.includes("security:manage") ||
          session?.permissions.includes("settings:write")
      ),
    [session]
  );

  useEffect(() => {
    if (!isReady || !session || !canManageAdmins) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadMessage("");

    fetch("/api/admin/access", {
      headers: {
        "x-admin-session": JSON.stringify(session)
      }
    })
      .then(async (response) => {
        const result = (await response.json().catch(() => ({}))) as AccessResponse;

        if (!response.ok) {
          throw new Error(result.message ?? "Unable to load admin access.");
        }

        if (isMounted) {
          setAdmins(result.admins ?? []);
          setRoles(result.roles ?? []);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadMessage(error instanceof Error ? error.message : "Unable to load admin access.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [canManageAdmins, isReady, session]);

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChangeError("");
    setChangeMessage("");

    if (changeForm.newPassword !== changeForm.confirmPassword) {
      setChangeError("New password and confirm password must match.");
      return;
    }

    if (!session) {
      setChangeError("Login again before changing your password.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/admin/access/password", {
        body: JSON.stringify({
          currentPassword: changeForm.currentPassword,
          email: session.email,
          mode: "change",
          newPassword: changeForm.newPassword
        }),
        headers: {
          "Content-Type": "application/json",
          "x-admin-session": JSON.stringify(session)
        },
        method: "PATCH"
      });
      const result = (await response.json().catch(() => ({}))) as AccessResponse;

      if (!response.ok || !result.session) {
        setChangeError(result.message ?? "Unable to update password.");
        return;
      }

      persistAdminSession(result.session);
      setChangeForm({ confirmPassword: "", currentPassword: "", newPassword: "" });
      setChangeMessage(result.message ?? "Password updated successfully.");
    } catch {
      setChangeError("Unable to update password right now.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");
    setCreateMessage("");

    if (!session) {
      setCreateError("Login again before creating admins.");
      return;
    }

    setIsCreatingAdmin(true);

    try {
      const response = await fetch("/api/admin/access", {
        body: JSON.stringify({
          email: createForm.email,
          fullName: createForm.fullName,
          password: createForm.password,
          roleNames: [createForm.roleName]
        }),
        headers: {
          "Content-Type": "application/json",
          "x-admin-session": JSON.stringify(session)
        },
        method: "POST"
      });
      const result = (await response.json().catch(() => ({}))) as AccessResponse;

      if (!response.ok) {
        setCreateError(result.message ?? "Unable to create admin.");
        return;
      }

      setCreateForm({
        email: "",
        fullName: "",
        password: "",
        roleName: roles[0]?.name ?? "Admin"
      });
      setCreateMessage(result.message ?? "Admin account created successfully.");

      const refreshed = await fetch("/api/admin/access", {
        headers: {
          "x-admin-session": JSON.stringify(session)
        }
      });
      const refreshedResult = (await refreshed.json().catch(() => ({}))) as AccessResponse;

      if (refreshed.ok) {
        setAdmins(refreshedResult.admins ?? []);
        setRoles(refreshedResult.roles ?? roles);
      }
    } catch {
      setCreateError("Unable to create admin right now.");
    } finally {
      setIsCreatingAdmin(false);
    }
  }

  if (!isReady) {
    return <div className="rounded-card border border-black/10 bg-white p-5 text-sm font-semibold text-slate">Loading admin access…</div>;
  }

  if (!session) {
    return <div className="rounded-card border border-black/10 bg-white p-5 text-sm font-semibold text-slate">Login required.</div>;
  }

  return (
    <div className="grid gap-6">
      <AdminCard
        description="Use your current password to set a new one. For forgotten passwords, the login screen now includes a recovery form tied to the deployment owner credentials."
        title="Password"
      >
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handlePasswordChange}>
          <PasswordInput
            label="Current password"
            onChange={(event) => setChangeForm((current) => ({ ...current, currentPassword: event.target.value }))}
            value={changeForm.currentPassword}
          />
          <PasswordInput
            label="New password"
            onChange={(event) => setChangeForm((current) => ({ ...current, newPassword: event.target.value }))}
            value={changeForm.newPassword}
          />
          <PasswordInput
            label="Confirm new password"
            onChange={(event) => setChangeForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            value={changeForm.confirmPassword}
          />
          <div className="md:col-span-3 flex flex-wrap items-center gap-3">
            <button className="focus-ring rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={isChangingPassword} type="submit">
              {isChangingPassword ? "Updating..." : "Update password"}
            </button>
            {changeError ? <p className="text-sm font-semibold text-coral">{changeError}</p> : null}
            {changeMessage ? <p className="text-sm font-semibold text-forest">{changeMessage}</p> : null}
          </div>
        </form>
      </AdminCard>

      <AdminCard
        description={canManageAdmins ? "Create additional admins and assign a role for day-to-day operations." : "Your current role can change its own password, but cannot create new admins."}
        title="Admin access"
      >
        {canManageAdmins ? (
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCreateAdmin}>
            <Input
              label="Full name"
              onChange={(event) => setCreateForm((current) => ({ ...current, fullName: event.target.value }))}
              value={createForm.fullName}
            />
            <Input
              label="Admin email"
              onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
              type="email"
              value={createForm.email}
            />
            <PasswordInput
              label="Temporary password"
              onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
              value={createForm.password}
            />
            <Select
              label="Role"
              onChange={(event) => setCreateForm((current) => ({ ...current, roleName: event.target.value }))}
              value={createForm.roleName}
            >
              {roles.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name} ({role.permissions} permissions)
                </option>
              ))}
            </Select>
            <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
              <button className="focus-ring rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={isCreatingAdmin} type="submit">
                {isCreatingAdmin ? "Creating..." : "Create admin"}
              </button>
              {createError ? <p className="text-sm font-semibold text-coral">{createError}</p> : null}
              {createMessage ? <p className="text-sm font-semibold text-forest">{createMessage}</p> : null}
            </div>
          </form>
        ) : null}

        <div className="mt-6 overflow-x-auto">
          {loadMessage ? <p className="text-sm font-semibold text-coral">{loadMessage}</p> : null}
          {isLoading ? <p className="text-sm font-semibold text-slate">Loading admins...</p> : null}
          {!isLoading && canManageAdmins ? (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-slate">
                  <th className="py-3 pr-4 font-semibold">Admin</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Roles</th>
                  <th className="py-3 font-semibold">Last login</th>
                </tr>
              </thead>
              <tbody>
                {admins?.map((admin) => (
                  <tr className="border-b border-black/5" key={admin.id}>
                    <td className="py-3 pr-4 font-semibold text-ink">{admin.fullName}</td>
                    <td className="py-3 pr-4 text-slate">{admin.email}</td>
                    <td className="py-3 pr-4 text-slate">{admin.roles.join(", ")}</td>
                    <td className="py-3 text-slate">{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </AdminCard>
    </div>
  );
}
