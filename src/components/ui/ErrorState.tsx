import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Please try again."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-card border border-coral/30 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-coral/10 text-coral">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate">{description}</p>
      <div className="mt-5">
        <Button href="/" variant="dark">
          Back to home
        </Button>
      </div>
    </div>
  );
}
