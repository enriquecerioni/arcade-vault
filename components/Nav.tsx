"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { setUser, useUser } from "@/lib/storage";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = useUser();

  const isActive = (section: "home" | "biblioteca" | "salon" | "login") => {
    if (section === "home") return pathname === "/";
    if (section === "biblioteca") {
      return pathname === "/biblioteca" || pathname.startsWith("/juego") || pathname.startsWith("/jugar");
    }
    if (section === "salon") return pathname === "/salon";
    return pathname === "/login";
  };

  const handleSignOut = () => {
    setUser(null);
  };

  const closeMenu = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={closeMenu}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={isActive("home") ? "active" : ""}>Inicio</Link>
          <Link href="/biblioteca" className={isActive("biblioteca") ? "active" : ""}>Biblioteca</Link>
          <Link href="/salon" className={isActive("salon") ? "active" : ""}>Salón de la Fama</Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={handleSignOut}>{user.name} ▾</button>
        ) : (
          <Link href="/login" className="btn auth-btn">Iniciar Sesión</Link>
        )}
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">≡</button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={closeMenu}></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>MENÚ</div>
        <Link href="/" className={isActive("home") ? "active" : ""} onClick={closeMenu}>Inicio</Link>
        <Link href="/biblioteca" className={isActive("biblioteca") ? "active" : ""} onClick={closeMenu}>Biblioteca</Link>
        <Link href="/salon" className={isActive("salon") ? "active" : ""} onClick={closeMenu}>Salón de la Fama</Link>
        <Link href="/login" className={isActive("login") ? "active" : ""} onClick={closeMenu}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }}></div>
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>CRÉDITOS · 03</div>
      </aside>
    </>
  );
}
