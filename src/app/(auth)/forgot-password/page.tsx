import { ForgotPasswordClient } from "@/components/auth/AuthFormClient";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Forgot Password"
};

export default function ForgotPasswordPage() {
  return (
    <SiteShell>
      <ForgotPasswordClient />
    </SiteShell>
  );
}
