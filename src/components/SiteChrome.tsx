import { Link } from "@tanstack/react-router";
import { Feather } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 serif-title text-xl">
          <Feather className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <span>Shabdon Ka Ghar</span>
          <span className="deva text-muted-foreground text-lg">· शब्दों का घर</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" activeOptions={{ exact: true }} className="hover:text-primary [&.active]:text-primary [&.active]:font-medium">
            Home
          </Link>
          <Link to="/poems" className="hover:text-primary [&.active]:text-primary [&.active]:font-medium">
            All Poems
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
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground flex justify-between">
        <span>© {new Date().getFullYear()} Shabdon Ka Ghar</span>
        <Link to="/admin" className="hover:text-primary">
          ·
        </Link>
      </div>
    </footer>
  );
}
