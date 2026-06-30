import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function SectionTitle({
  action,
  alignment = "left",
  description,
  title
}: {
  action?: ReactNode;
  alignment?: "left" | "center" | "right";
  description?: string;
  title: string;
}) {
  const isCentered = alignment === "center";
  const isRight = alignment === "right";

  return (
    <div
      className={cn(
        "mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
        isCentered && "items-center text-center sm:items-center",
        isRight && "items-end text-right sm:items-end"
      )}
    >
      <div className={cn(isCentered && "mx-auto", isRight && "ml-auto")}>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h2>
        {description ? (
          <p className={cn("mt-2 max-w-2xl text-sm leading-6 text-slate", isCentered && "mx-auto", isRight && "ml-auto")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={cn(isCentered && "mx-auto", isRight && "ml-auto")}>{action}</div> : null}
    </div>
  );
}
