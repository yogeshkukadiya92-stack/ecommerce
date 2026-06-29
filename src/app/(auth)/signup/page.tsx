import { AuthFormClient } from "@/components/auth/AuthFormClient";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Sign Up | FitSupplement Store"
};

export default function SignupPage() {
  return (
    <SiteShell>
      <AuthFormClient mode="signup" />
    </SiteShell>
  );
}
