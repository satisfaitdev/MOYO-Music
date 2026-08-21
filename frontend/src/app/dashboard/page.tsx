"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Music, 
  Radio, 
  ShieldCheck, 
  Wallet, 
  Ticket, 
  PlusCircle, 
  ScanLine, 
  Palette, 
  DollarSign, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Car, 
  Play, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertCircle,
  FileCheck,
  Send,
  Eye
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { monitoringApi, bcdaApi, ticketingApi, marketplaceApi } from "@/lib/api";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [artistStats, setArtistStats] = useState<any>(null);
  const [bcdaStats, setBcdaStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [recentDetections, setRecentDetections] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
      return;
    }

    const loadRoleData = async () => {
      try {
        if (user?.role === "artist") {
          const [airplay, stData] = await Promise.all([
            monitoringApi.getArtistAirplay().catch(() => ({ stats: null })),
            bcdaApi.getStats().catch(() => null),
          ]);
          setArtistStats(airplay.stats);
          setBcdaStats(stData);
        } else if (user?.role === "organizer") {
          const res = await ticketingApi.getEvents().catch(() => ({ events: [] }));
          setEvents(res.events || []);
        } else if (user?.role === "painter") {
          const res = await marketplaceApi.getMyArtworks().catch(() => ({ artworks: [] }));
          setArtworks(res.artworks || []);
        } else if (user?.role === "bcda_agent" || user?.role === "admin") {
          const [stData, feed] = await Promise.all([
            bcdaApi.getStats().catch(() => null),
            monitoringApi.getLiveFeed().catch(() => ({ detections: [] })),
          ]);
          setBcdaStats(stData);
          setRecentDetections(feed.detections || []);
        }
      } catch (err) {
        console.error("Erreur chargement dashboard", err);
      }
    };

    if (user) {
      loadRoleData();
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-4 border-congo-yellow border-t-transparent rounded-full animate-spin mr-3"></div>
        <span>Chargement de votre Espace de Travail...</span>
      </div>
    );
  }

  const role = user.role;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. EN-TÊTE BIENVENUE DU TABLEAU DE BORD */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Session Active 🇨🇬
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Bonjour, <span className="text-congo-yellow">{user.artist_name || user.full_name}</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            {role === "artist" && "Gérez vos sorties musicales, surveillez vos diffusions radios/TV en direct et suivez vos redevances BCDA."}
            {role === "organizer" && "Pilotez vos concerts, suivez vos ventes de billets MoMo et homologuez vos tirages papier BCDA."}
            {role === "painter" && "Gérez votre galerie, certifiez vos toiles de l'École de Poto-Poto et suivez vos ventes d'art."}
            {(role === "bcda_agent" || role === "admin") && "Supervisez la collecte nationale, le monitoring H24 des radios/TV et la répartition des redevances."}
          </p>
        </div>

        {/* Badge Portefeuille Rapide */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right min-w-[200px]">
          <span className="text-[10px] text-slate-400 block font-semibold">Solde Disponible (MoMo / Airtel) :</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {(user.wallet_balance_fcfa || 0).toLocaleString()} <span className="text-xs font-normal">FCFA</span>
          </p>
          <Link
            href="/wallet"
            className="inline-flex items-center space-x-1 text-[11px] text-congo-yellow hover:underline mt-2 font-bold"
          >
            <span>Retirer des Fonds</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABLEAU DE BORD : ARTISTE MUSICIEN (Ex: Prince Nzassi) */}
      {/* ========================================================================= */}
      {role === "artist" && (
        <div className="space-y-8">
          {/* Cartes Métriques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Passages Radios & TV Congo</span>
                <Radio className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">{artistStats?.total_airplay_count || 18}</p>
              <span className="text-[11px] text-emerald-400">Télé Congo, DRTV, Top Congo FM</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Redevances BCDA Estimées</span>
                <DollarSign className="w-4 h-4 text-congo-yellow" />
              </div>
              <p className="text-3xl font-black text-congo-yellow mt-2">
                {(artistStats?.total_estimated_royalties_fcfa || 28500).toLocaleString()} FCFA
              </p>
              <span className="text-[11px] text-slate-500">Collectées via monitoring & vignettes</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Chansons & Clips Certifiés</span>
                <ShieldCheck className="w-4 h-4 text-congo-green" />
              </div>
              <p className="text-3xl font-black text-white mt-2">3</p>
              <span className="text-[11px] text-slate-500">Avec codes ISWC & ISRC BCDA</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Streams DSPs (Spotify/Apple)</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-purple-400 mt-2">142 800</p>
              <span className="text-[11px] text-slate-500">SonoSuite Distribution</span>
            </div>
          </div>

          {/* Raccourcis d'action rapide vers les sous-pages dédiées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/distribution/nouveau"
              className="p-5 bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-800/60 rounded-3xl shadow-xl hover:border-emerald-500 transition group"
            >
              <Music className="w-8 h-8 text-congo-green mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Distribuer une Nouvelle Chanson</h3>
              <p className="text-xs text-slate-400 mt-1">Envoyez votre titre sur Spotify, Apple Music, TikTok, Boomplay et YouTube.</p>
            </Link>

            <Link
              href="/bcda/deposer"
              className="p-5 bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-800/60 rounded-3xl shadow-xl hover:border-congo-yellow transition group"
            >
              <ShieldCheck className="w-8 h-8 text-congo-yellow mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Déposer au BCDA (5 Volets)</h3>
              <p className="text-xs text-slate-400 mt-1">Enregistrez vos paroles, mélodie, master et clip vidéo pour sécuriser vos droits.</p>
            </Link>

            <Link
              href="/monitoring"
              className="p-5 bg-gradient-to-br from-slate-900 to-sky-950/40 border border-sky-800/60 rounded-3xl shadow-xl hover:border-sky-400 transition group"
            >
              <Radio className="w-8 h-8 text-sky-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Écouter le Direct Radios/TV</h3>
              <p className="text-xs text-slate-400 mt-1">Regardez les flux en direct et voyez les détections IA de vos titres en temps réel.</p>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TABLEAU DE BORD : PROMOTEUR DE CONCERTS (Ex: Brazza Live Prod) */}
      {/* ========================================================================= */}
      {role === "organizer" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Événements Créés</span>
                <Ticket className="w-4 h-4 text-congo-red" />
              </div>
              <p className="text-3xl font-black text-white mt-2">{events.length || 1}</p>
              <span className="text-[11px] text-emerald-400">Billetterie ouverte</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Billets MoMo Vendus</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl font-black text-sky-400 mt-2">123</p>
              <span className="text-[11px] text-slate-500">Scannables par QR Code</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Recettes Billetterie</span>
                <DollarSign className="w-4 h-4 text-congo-yellow" />
              </div>
              <p className="text-3xl font-black text-congo-yellow mt-2">615 000 FCFA</p>
              <span className="text-[11px] text-slate-500">100% sécurisé</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Tirages Papier Homologués BCDA</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-purple-400 mt-2">1 Lot</p>
              <span className="text-[11px] text-purple-300">Canal A (Guichets)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/billetterie/creer"
              className="p-5 bg-gradient-to-br from-slate-900 to-red-950/40 border border-red-800/60 rounded-3xl shadow-xl hover:border-congo-red transition group"
            >
              <PlusCircle className="w-8 h-8 text-congo-red mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Créer un Nouvel Événement</h3>
              <p className="text-xs text-slate-400 mt-1">Configurez le prix, la capacité, la salle et les splits artistes automatisés.</p>
            </Link>

            <Link
              href="/billetterie/scan"
              className="p-5 bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-800/60 rounded-3xl shadow-xl hover:border-congo-yellow transition group"
            >
              <ScanLine className="w-8 h-8 text-congo-yellow mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Scanner les Billets aux Portes</h3>
              <p className="text-xs text-slate-400 mt-1">Validez les QR codes des spectateurs à l'entrée avec votre smartphone.</p>
            </Link>

            <Link
              href="/bcda"
              className="p-5 bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-800/60 rounded-3xl shadow-xl hover:border-purple-500 transition group"
            >
              <Ticket className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Billetterie Papier & Rapprochement BCDA</h3>
              <p className="text-xs text-slate-400 mt-1">Générez vos timbres d'imprimerie et régularisez les invendus après le spectacle.</p>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TABLEAU DE BORD : MAÎTRE PEINTRE (Ex: Maître Mouanga - Poto-Poto) */}
      {/* ========================================================================= */}
      {role === "painter" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Toiles & Sculptures Exposées</span>
                <Palette className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">{artworks.length || 4}</p>
              <span className="text-[11px] text-emerald-400">École de Peinture de Poto-Poto</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Certificats d'Authenticité EPP</span>
                <ShieldCheck className="w-4 h-4 text-congo-green" />
              </div>
              <p className="text-3xl font-black text-congo-green mt-2">4</p>
              <span className="text-[11px] text-slate-500">Inviolables avec QR Code</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Total Ventes d'Art</span>
                <DollarSign className="w-4 h-4 text-congo-yellow" />
              </div>
              <p className="text-3xl font-black text-congo-yellow mt-2">450 000 FCFA</p>
              <span className="text-[11px] text-slate-500">Payé par Mobile Money</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/galerie/ajouter"
              className="p-6 bg-gradient-to-br from-slate-900 to-sky-950/40 border border-sky-800/60 rounded-3xl shadow-xl hover:border-sky-400 transition group"
            >
              <PlusCircle className="w-8 h-8 text-sky-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white">Ajouter & Certifier une Toile</h3>
              <p className="text-xs text-slate-400 mt-1">Téléversez votre œuvre et générez le certificat officiel d'authenticité EPP.</p>
            </Link>

            <Link
              href="/galerie"
              className="p-6 bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-800/60 rounded-3xl shadow-xl hover:border-congo-yellow transition group"
            >
              <Palette className="w-8 h-8 text-congo-yellow mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white">Gérer ma Galerie & Certificats</h3>
              <p className="text-xs text-slate-400 mt-1">Consultez vos œuvres en vente et imprimez les certificats QR pour les acheteurs.</p>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TABLEAU DE BORD : AGENT / INSPECTEUR BCDA & ADMIN */}
      {/* ========================================================================= */}
      {(role === "bcda_agent" || role === "admin") && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Œuvres & Clips Répertoriés</span>
                <Music className="w-4 h-4 text-congo-green" />
              </div>
              <p className="text-3xl font-black text-white mt-2">{bcdaStats?.total_works_registered || 3}</p>
              <span className="text-[11px] text-slate-500">ISWC, ISRC & Audiovisuel</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Taxis 100-100 & Bars Licenciés</span>
                <Car className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl font-black text-sky-400 mt-2">{bcdaStats?.total_licensed_venues || 6}</p>
              <span className="text-[11px] text-slate-500">Vignettes pare-brise actives</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Collecte Nationale Mensuelle</span>
                <DollarSign className="w-4 h-4 text-congo-yellow" />
              </div>
              <p className="text-3xl font-black text-congo-yellow mt-2">
                {(bcdaStats?.total_collected_fcfa || 150000).toLocaleString()} FCFA
              </p>
              <span className="text-[11px] text-slate-500">Vignettes + Monitoring</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Reversé sur Wallets Artistes</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-400 mt-2">
                {(bcdaStats?.total_paid_out_to_artists_fcfa || 0).toLocaleString()} FCFA
              </p>
              <span className="text-[11px] text-emerald-400">100% payé sans intermédiaire</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/bcda"
              className="p-5 bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-800/60 rounded-3xl shadow-xl hover:border-congo-yellow transition group"
            >
              <ShieldCheck className="w-8 h-8 text-congo-yellow mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Lancer une Répartition MoMo</h3>
              <p className="text-xs text-slate-400 mt-1">Ventilez les redevances aux 5 ayants droit et créditez instantanément leurs portefeuilles.</p>
            </Link>

            <Link
              href="/monitoring"
              className="p-5 bg-gradient-to-br from-slate-900 to-sky-950/40 border border-sky-800/60 rounded-3xl shadow-xl hover:border-sky-400 transition group"
            >
              <Radio className="w-8 h-8 text-sky-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Supervision IA Radios / TV</h3>
              <p className="text-xs text-slate-400 mt-1">Consultez les détections H24 sur Télé Congo, DRTV, Top Congo FM et les rapports officiels.</p>
            </Link>

            <Link
              href="/bcda"
              className="p-5 bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-800/60 rounded-3xl shadow-xl hover:border-congo-green transition group"
            >
              <Car className="w-8 h-8 text-congo-green mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-white">Contrôle Vignettes Taxis & Bars</h3>
              <p className="text-xs text-slate-400 mt-1">Recherchez une plaque d'immatriculation et vérifiez l'authenticité des QR codes de contrôle.</p>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
