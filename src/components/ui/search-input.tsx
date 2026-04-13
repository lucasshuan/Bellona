"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchInput({
  defaultValue,
  placeholder,
}: {
  defaultValue?: string;
  placeholder: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search
          className={`size-5 transition-colors ${isPending ? "text-primary animate-pulse" : "text-white/20"}`}
        />
      </div>
      <input
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="focus:border-primary/50 focus:ring-primary/10 h-12 w-full rounded-2xl border border-white/10 bg-white/5 pr-11 pl-11 text-sm outline-hidden transition-all placeholder:text-white/20 hover:border-white/20 focus:bg-white/[0.07] focus:ring-4"
        onChange={(e) => handleSearch(e.target.value)}
      />
      {defaultValue && (
        <button
          onClick={() => handleSearch("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/20 hover:text-white/40"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
