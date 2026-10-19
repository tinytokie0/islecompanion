import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";

const LOGO = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d4ae5dc23_TheHaven_CrystalDinosaurCrest.png";
const JUNGLE_BG = "https://media.base44.com/images/public/6ad1348a6847d99c1f0d362b/d8aef576a_generated_image.png";

export default function PortalLayout() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed jungle backdrop */}
      <div className="fixed inset-0 z-0">
        <Image src={JUNGLE_BG} alt="" className="w-full h-full" fittingType="fill" />
        <div className="absolute inset-0 bg-background/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <header className="sticky top-0 inset-x-0 z-50 bg-[#0c0c0f]/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-2 px-4 md:px-6 py-2">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <Image src={LOGO} alt="The Haven" className="w-7 h-7 shrink-0" fittingType="fit" />
            <span className="font-heading font-bold text-[15px] uppercase text-foreground leading-none">
              The Haven
            </span>
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-border mt-10 bg-[#0c0c0f]/70">
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-6">
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
            © 2026 THE HAVEN — FAN COMPANION, NOT AFFILIATED WITH THE ISLE
          </span>
        </div>
      </footer>
    </div>
  );
}