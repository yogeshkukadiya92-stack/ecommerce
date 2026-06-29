"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
  compact?: boolean;
  label?: string;
};

export function SearchBar({ compact = false, label = "Search supplements" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function runSearch() {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    router.push(params.size > 0 ? `/search?${params.toString()}` : "/search");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  return (
    <form
      className="flex h-11 w-full items-center rounded-md border border-black/10 bg-white px-3 shadow-sm"
      onSubmit={handleSubmit}
      role="search"
    >
      <button
        aria-label={`${label} submit`}
        className="focus-ring -ml-1 rounded-md p-1 text-slate hover:bg-mist hover:text-ink"
        onClick={runSearch}
        type="button"
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>
      <input
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-ink outline-none placeholder:text-slate"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={compact ? "Search" : "Search whey, creatine, vitamins"}
        value={query}
      />
      {query ? (
        <span className="rounded bg-mint px-2 py-1 text-xs font-bold text-forest">
          {query.length}
        </span>
      ) : null}
    </form>
  );
}
