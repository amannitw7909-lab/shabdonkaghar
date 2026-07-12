import { Link } from "@tanstack/react-router";
import { Feather } from "lucide-react";
import { SITE_AUTHOR } from "@/lib/site";


export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2 serif-title text-lg sm:text-xl">
          <Feather className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
          <span className="truncate">Shabdon Ka Ghar</span>
          <span className="deva hidden md:inline text-muted-foreground text-lg">· शब्दों का घर</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-4 text-sm sm:gap-6">
          <Link to="/" activeOptions={{ exact: true }} className="hover:text-primary [&.active]:text-primary [&.active]:font-medium">
            Home
          </Link>
          <Link to="/poems" className="hover:text-primary [&.active]:text-primary [&.active]:font-medium">
            Poems
          </Link>
          <Link to="/about" className="hover:text-primary [&.active]:text-primary [&.active]:font-medium">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span>
          Words by <span className="text-foreground font-medium">{SITE_AUTHOR.name}</span>
          <span className="deva ml-2">· {SITE_AUTHOR.nameDeva}</span>
        </span>
        <span className="flex items-center gap-3">
          <span>© {new Date().getFullYear()} Shabdon Ka Ghar</span>
          <Link to="/admin" className="hover:text-primary" aria-label="Admin">
            ·
          </Link>
        </span>
      </div>
    </footer>
  );
}

