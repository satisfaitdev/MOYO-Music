"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Music, 
  Radio, 
  ShieldCheck, 
  Wallet, 
  Ticket, 
  PlusCircle, 
  ScanLine, 
  Palette, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard,
  Car,
  Globe,
  Disc3,
  LogOut,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    studio: true,
    bcda: true,
    events: true,
    finance: true,
    public: true
  });

  if (!user) return null;

  const role = user.role; // 'artist', 'painter', 'organizer', 'bcda_agent', 'admin', 'fan'

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getRoleBadge = () => {
    switch (role) {
      case "artist":
        return { label: "Artiste Musicien", color: "bg-emerald-950 text-emerald-400 border-emerald-800" };
      case "organizer":
        return { label: "Promoteur Spectacles", color: "bg-red-950 text-red-400 border-red-800" };
      case "painter":
        return { label: "Maître Peintre", color: "bg-sky-950 text-sky-400 border-sky-800" };
      case "bcda_agent":
        return { label: "Inspecteur BCDA", color: "bg-amber-950 text-congo-yellow border-amber-800" };
      case "admin":
        return { label: "Administrateur", color: "bg-purple-950 text-purple-400 border-purple-800" };
      default:
        return { label: "Mélomane", color: "bg-slate-800 text-slate-300 border-slate-700" };
    }
  };

  const badge = getRoleBadge();

  return (
    <aside
      className={`hidden lg:flex flex-col bg-slate-950 border-r border-slate-800/80 transition-all duration-300 sticky top-0 h-screen z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* 1. LOGO PRINCIPAL MOYO CULTURE SUR LA MÊME COLONNE */}
      <div className={`p-3.5 border-b border-slate-800 flex ${isCollapsed ? "flex-col items-center gap-3" : "items-center justify-between"}`}>
        <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-congo-green via-congo-yellow to-congo-red flex items-center justify-center p-0.5 shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-congo-yellow" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-congo-yellow via-white to-congo-green bg-clip-text text-transparent block">
                MOYO CULTURE
              </span>
              <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase block">
                Congo-Brazzaville 🇨🇬
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex-shrink-0 ${isCollapsed ? "w-8 h-8 flex items-center justify-center" : ""}`}
          title={isCollapsed ? "Déplier la barre" : "Replier la barre"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. PROFIL UTILISATEUR & BADGE MÉTIER */}
      <div className="p-3.5 bg-slate-900/50 border-b border-slate-800/80">
        {!isCollapsed ? (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <strong className="text-white text-xs font-bold truncate block">
                {user.artist_name || user.full_name}
              </strong>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
        )}
      </div>

      {/* 3. MENU DE NAVIGATION SELON LE RÔLE */}
      <div className="flex-1 py-3 px-3 space-y-3 overflow-y-auto">
        
        {/* LIEN ACCUEIL TABLEAU DE BORD */}
        <Link
          href="/dashboard"
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
            pathname === "/dashboard"
              ? "bg-congo-yellow text-slate-950 shadow-md font-extrabold"
              : "text-slate-300 hover:text-white hover:bg-slate-900"
          } ${isCollapsed ? "justify-center px-2" : ""}`}
          title="Tableau de Bord Général"
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Tableau de Bord</span>}
        </Link>

        {/* SECTION ARTISTE : MUSIQUE & PRODUCTION */}
        {(role === "artist" || role === "admin") && (
          <div className="space-y-1">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection("studio")}
                className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 tracking-wider px-2 py-1"
              >
                <span>🎵 Musique & Studio</span>
                {openSections.studio ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {(openSections.studio || isCollapsed) && (
              <div className="space-y-1">
                <Link
                  href="/distribution"
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    pathname.startsWith("/distribution") ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : "text-slate-400 hover:text-white hover:bg-slate-900"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                  title="Mes Sorties & Distribution DSPs (Spotify, Apple, Boomplay)"
                >
                  <Music className="w-4 h-4 flex-shrink-0 text-congo-green" />
                  {!isCollapsed && <span>Distribution DSPs</span>}
                </Link>

                <Link
                  href="/monitoring"
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    pathname === "/monitoring" ? "bg-sky-950 text-sky-400 border border-sky-800/60" : "text-slate-400 hover:text-white hover:bg-slate-900"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                  title="Mes Passages Radios / TV Congo (IA)"
                >
                  <Radio className="w-4 h-4 flex-shrink-0 text-sky-400" />
                  {!isCollapsed && <span>Mes Passages Radios/TV</span>}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* SECTION DROITS BCDA */}
        <div className="space-y-1">
          {!isCollapsed && (
            <button
              onClick={() => toggleSection("bcda")}
              className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 tracking-wider px-2 py-1"
            >
              <span>🏛️ Droits BCDA</span>
              {openSections.bcda ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {(openSections.bcda || isCollapsed) && (
            <div className="space-y-1">
              <Link
                href="/bcda"
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  pathname === "/bcda" ? "bg-amber-950 text-congo-yellow border border-amber-800/60" : "text-slate-400 hover:text-white hover:bg-slate-900"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="Gérer mes Œuvres Déposées & Mes Splits"
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-congo-yellow" />
                {!isCollapsed && <span>Mes Œuvres & Splits BCDA</span>}
              </Link>
            </div>
          )}
        </div>

        {/* SECTION CONCERTS, SPECTACLES & COLLABORATIONS */}
        {(role === "artist" || role === "organizer" || role === "admin") && (
          <div className="space-y-1">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection("events")}
                className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 tracking-wider px-2 py-1"
              >
                <span>🎟️ Concerts & Collaborations</span>
                {openSections.events ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {(openSections.events || isCollapsed) && (
              <div className="space-y-1">
                {/* MES SPECTACLES (PAGE PRIVÉE DE L'ARTISTE/PROMOTEUR AVEC CRÉATION & SCAN INTÉGRÉS) */}
                <Link
                  href="/billetterie/mes-evenements"
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    pathname.startsWith("/billetterie/mes-evenements") || pathname === "/billetterie/creer" ? "bg-red-950 text-congo-red border border-red-800/60 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-900"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                  title="Mes Spectacles & Concerts Privés"
                >
                  <Ticket className="w-4 h-4 flex-shrink-0 text-congo-red" />
                  {!isCollapsed && <span>Mes Spectacles & Concerts</span>}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* SECTION PEINTRE : GALERIE */}
        {role === "painter" && (
          <div className="space-y-1">
            <Link
              href="/galerie"
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === "/galerie" ? "bg-sky-950 text-sky-400 border border-sky-800/60" : "text-slate-400 hover:text-white hover:bg-slate-900"
              } ${isCollapsed ? "justify-center px-2" : ""}`}
            >
              <Palette className="w-4 h-4 flex-shrink-0 text-sky-400" />
              {!isCollapsed && <span>Ma Galerie Poto-Poto</span>}
            </Link>

            <Link
              href="/galerie/ajouter"
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === "/galerie/ajouter" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : "text-slate-400 hover:text-white hover:bg-slate-900"
              } ${isCollapsed ? "justify-center px-2" : ""}`}
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              {!isCollapsed && <span>Certifier une Toile (EPP)</span>}
            </Link>
          </div>
        )}

        {/* SECTION FINANCES & REVENUS MOMO */}
        <div className="space-y-1">
          {!isCollapsed && (
            <button
              onClick={() => toggleSection("finance")}
              className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 tracking-wider px-2 py-1"
            >
              <span>💰 Portefeuille MoMo</span>
              {openSections.finance ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {(openSections.finance || isCollapsed) && (
            <div className="space-y-1">
              <Link
                href="/wallet"
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  pathname === "/wallet" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : "text-slate-400 hover:text-white hover:bg-slate-900"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="Mon Portefeuille & Retraits MoMo"
              >
                <Wallet className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                {!isCollapsed && <span>Solde & Retraits MoMo</span>}
              </Link>
            </div>
          )}
        </div>

        {/* SECTION PAGES & SERVICES PUBLICS */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          {!isCollapsed && (
            <button
              onClick={() => toggleSection("public")}
              className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 tracking-wider px-2 py-1"
            >
              <span>🌐 Pages Publiques</span>
              {openSections.public ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          {(openSections.public || isCollapsed) && (
            <div className="space-y-1">
              <Link
                href="/billetterie"
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition ${
                  pathname === "/billetterie" ? "text-congo-red font-bold" : ""
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="Tous les Spectacles Publics"
              >
                <Ticket className="w-3.5 h-3.5 flex-shrink-0 text-congo-red" />
                {!isCollapsed && <span>Billetterie Publique</span>}
              </Link>

              <Link
                href="/repertoire-public"
                className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl text-xs text-congo-yellow hover:text-amber-300 hover:bg-slate-900 transition ${
                  pathname === "/repertoire-public" ? "text-congo-yellow font-bold" : ""
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title="Répertoire BCDA Public & Vignettes"
              >
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-congo-yellow" />
                {!isCollapsed && <span>Répertoire BCDA Public</span>}
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* 4. BAS DE SIDEBAR : SOLDE MOMO & DÉCONNEXION UNIQUE */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {!isCollapsed && (
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[10px] block">Solde Mobile Money :</span>
            <strong className="text-emerald-400 font-black text-sm">
              {(user.wallet_balance_fcfa || 0).toLocaleString()} FCFA
            </strong>
          </div>
        )}

        {/* BOUTON CHANGEMENT DE THÈME CLAIR / SOMBRE */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
          title={theme === "dark" ? "Passer en mode Clair ☀️" : "Passer en mode Sombre 🌙"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-congo-yellow flex-shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-sky-400 flex-shrink-0" />
          )}
          {!isCollapsed && (
            <span>{theme === "dark" ? "Mode Clair ☀️" : "Mode Sombre 🌙"}</span>
          )}
        </button>

        <button
          onClick={logout}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 hover:border hover:border-red-800/60 transition ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
