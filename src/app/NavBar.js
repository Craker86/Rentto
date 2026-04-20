"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Building2, User } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  const items = [
    { href: "/dashboard", label: "Inicio", Icon: Home },
    { href: "/pagar", label: "Pagar", Icon: Wallet },
    { href: "/propiedades", label: "Explorar", Icon: Building2 },
    { href: "/perfil", label: "Perfil", Icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-stroke max-w-md mx-auto">
      <div className="flex justify-around py-2 pb-5">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 ${active ? "text-brand-700" : "text-fg-subtle"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
