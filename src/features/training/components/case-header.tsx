import Link from "next/link";

export function CaseHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold tracking-widest text-white">STR</span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-slate-900">STR Search</span>
            <span className="block text-xs text-slate-500">Analyst training</span>
          </span>
        </Link>
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">All cases</Link>
      </div>
    </header>
  );
}
