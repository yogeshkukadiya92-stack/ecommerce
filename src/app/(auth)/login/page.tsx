import { AuthFormClient } from "@/components/auth/AuthFormClient";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <SiteShell>
      <AuthFormClient mode="login" />
    </SiteShell>
  );
}
