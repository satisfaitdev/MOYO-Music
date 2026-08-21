"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Video, 
  Mic2, 
  Radio, 
  Share2, 
  FileCheck, 
  Calendar, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  PhoneCall, 
  Clock, 
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Flame
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ServiceItem {
  id: string;
  category: "production" | "video" | "marketing" | "presse" | "juridique";
  title: string;
  subtitle: string;
  priceFcfa: number;
  duration: string;
  features: string[];
  icon: any;
  badge?: string;
}

const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: "mix_master",
    category: "production",
    title: "Mixage & Mastering Dolby / Stems",
    subtitle: "Qualité radio & streaming international pour vos singles",
    priceFcfa: 45000,
    duration: "48h à 72h",
    features: [
      "Mastering adapté aux normes Spotify, Apple Music & YouTube (-14 LUFS)",
      "Traitement acoustique des voix et instruments de Rumba/Afrobeat",
      "Livraison en WAV 24-bit 44.1kHz + version MP3 320kbps",
      "3 retouches gratuites incluses"
    ],
    icon: Mic2,
    badge: "Populaire"
  },
  {
    id: "clip_pro",
    category: "video",
    title: "Tournage & Réalisation Clip Vidéo 4K",
    subtitle: "Production vidéo complète à Brazzaville ou Pointe-Noire",
    priceFcfa: 350000,
    duration: "7 à 10 jours",
    features: [
      "Réalisateur professionnel avec caméra Cinéma 4K & Drone",
      "Étalonnage couleur cinématique & effets spéciaux",
      "Format TV 16:9 + 3 Teasers verticaux 9:16 pour TikTok & Reels",
      "Enregistrement des droits audiovisuels au BCDA inclus"
    ],
    icon: Video,
    badge: "Recommandé"
  },
  {
    id: "pochette_hd",
    category: "video",
    title: "Création Pochette HD & Identité Visuelle",
    subtitle: "Cover art conforme aux exigences Spotify et Apple Music",
    priceFcfa: 20000,
    duration: "24h à 48h",
    features: [
      "Image haute résolution 3000 x 3000 px sans pixellisation",
      "Déclinaisons pour bannières Spotify for Artists, Facebook & YouTube",
      "Respect strict des directives DDEX et Sonosuite (pas de logos superflus)",
      "Fichiers sources fournis"
    ],
    icon: Layers
  },
  {
    id: "promo_tiktok",
    category: "marketing",
    title: "Campagne TikTok & Influenceurs Congo 242",
    subtitle: "Créez la tendance sur votre nouveau morceau",
    priceFcfa: 75000,
    duration: "14 jours de campagne",
    features: [
      "Mise en avant par 5 créateurs de contenu TikTok congolais (+100k abonnés)",
      "Challenge danse ou playback avec votre extrait audio officiel",
      "Rapport complet des vues, partages et créations de vidéos",
      "Boost de streaming garanti sur Spotify et Boomplay"
    ],
    icon: Flame,
    badge: "Tendance"
  },
  {
    id: "presse_radio",
    category: "presse",
    title: "Pack Diffusion Radios & Télé Congo",
    subtitle: "Pitch officiel et envoi direct aux programmateurs nationaux",
    priceFcfa: 60000,
    duration: "7 jours",
    features: [
      "Envoi du single masterisé aux directeurs d'antenne (Télé Congo, DRTV, Top Congo FM)",
      "Rédaction d'un Communiqué de Presse professionnel",
      "Suivi des passages d'antenne avec notre monitoring IA H24",
      "Relance auprès des animateurs d'émissions culturelles"
    ],
    icon: Radio
  },
  {
    id: "contrat_juridique",
    category: "juridique",
    title: "Conseil Juridique, Splits & Contrats BCDA",
    subtitle: "Sécurisez vos collaborations, featurings et contrats de management",
    priceFcfa: 30000,
    duration: "Immédiat",
    features: [
      "Modèles de contrats de cession de droits et split-sheet BCDA certifiés",
      "Relecture de contrats de label, distribution ou booking",
      "Accompagnement pour l'immatriculation d'œuvres complexes",
      "Assistance par un juriste spécialisé en propriété intellectuelle"
    ],
    icon: FileCheck
  }
];

export default function Services360Page() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [orderedService, setOrderedService] = useState<ServiceItem | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [artistNotes, setArtistNotes] = useState("");

  const filteredServices = selectedCategory === "all" 
    ? SERVICES_CATALOG 
    : SERVICES_CATALOG.filter(s => s.category === selectedCategory);

  const handleOrder = (service: ServiceItem) => {
    setOrderedService(service);
    setOrderSuccess(false);
    setArtistNotes("");
  };

  const handleConfirmOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setOrderSuccess(true);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* 1. EN-TÊTE SERVICES 360° */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs font-bold text-congo-green">
            <Sparkles className="w-4 h-4 text-congo-yellow" />
            <span>Accompagnement Carrière • Écosystème Moyo Culture 360° 🇨🇬</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Services & Packs 360° pour Artistes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            De la production studio à la réalisation de clips vidéo 4K, en passant par les campagnes TikTok, la diffusion sur <strong>Télé Congo / DRTV</strong> et la protection juridique BCDA : boostez votre carrière musicale en toute autonomie.
          </p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-right min-w-[220px] z-10 shadow-lg">
          <span className="text-[10px] text-slate-400 block font-semibold">Paiement Garanti & Direct :</span>
          <p className="text-xl font-black text-congo-yellow mt-1">Mobile Money</p>
          <span className="text-[11px] text-emerald-400 block">MTN MoMo & Airtel Money 🇨🇬</span>
        </div>
      </div>

      {/* 2. PACK PREMIUM 360° CARRIÈRE (MISE EN AVANT) */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-amber-950/40 border-2 border-congo-green/50 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-congo-yellow text-slate-950 uppercase tracking-wider">
            Pack All-Inclusive 360°
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Pack Lancement d'Album & Rayonnement National
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Comprend : Mastering Complet (10 titres) + Clip Vidéo 4K + Dépôt BCDA & Splits + Distribution DSPs Mondiale + Campagne TikTok 500k vues + Envoi Presse & Radios Congo.
          </p>
        </div>

        <div className="text-left lg:text-right space-y-3 flex-shrink-0">
          <div>
            <span className="text-xs text-slate-400 block line-through">650 000 FCFA</span>
            <strong className="text-2xl sm:text-3xl font-black text-congo-yellow">490 000 FCFA</strong>
          </div>
          <button
            onClick={() => handleOrder({
              id: "pack_all_in",
              category: "marketing",
              title: "Pack All-Inclusive 360° Lancement d'Album",
              subtitle: "Production, Clip 4K, Distribution, BCDA & Promo Radios/TikTok",
              priceFcfa: 490000,
              duration: "30 jours d'accompagnement",
              features: [
                "Mastering complet 10 titres",
                "Clip vidéo 4K réalisé à Brazzaville/Pointe-Noire",
                "Distribution DSPs mondiale (TuneCore standard)",
                "Dépôt officiel BCDA avec feuille de splits",
                "Campagne TikTok 500k vues + Passage Télé Congo & Top Congo FM"
              ],
              icon: Award,
              badge: "Pack Complet"
            })}
            className="px-6 py-3.5 bg-congo-green hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-xl transition flex items-center space-x-2"
          >
            <span>Commander le Pack 360°</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. FILTRES DE SERVICES */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { id: "all", label: "Tous les Services" },
          { id: "production", label: "Studio & Mastering" },
          { id: "video", label: "Clips & Graphisme" },
          { id: "marketing", label: "TikTok & Playlists" },
          { id: "presse", label: "Radios & TV Congo" },
          { id: "juridique", label: "Juridique & BCDA" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === tab.id
                ? "bg-congo-green text-white shadow-md"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. GRILLE DES SERVICES À LA CARTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-congo-green group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  {service.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-congo-yellow border border-amber-800">
                      {service.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-congo-green transition">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{service.subtitle}</p>
                </div>

                {/* Caractéristiques incluses */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-congo-green flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Délai : {service.duration}</span>
                  </span>
                  <strong className="text-lg font-black text-congo-yellow">
                    {service.priceFcfa.toLocaleString()} FCFA
                  </strong>
                </div>

                <button
                  onClick={() => handleOrder(service)}
                  className="px-4 py-2.5 bg-congo-green hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md"
                >
                  <span>Commander</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MODAL DE COMMANDE D'UN SERVICE */}
      {orderedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            {!orderSuccess ? (
              <>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] text-congo-green font-bold uppercase tracking-wider">Réservation de Service 360°</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{orderedService.title}</h3>
                  </div>
                  <button
                    onClick={() => setOrderedService(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tarif du Service :</span>
                    <strong className="text-congo-yellow text-sm font-black">{orderedService.priceFcfa.toLocaleString()} FCFA</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Délai estimé de livraison :</span>
                    <span className="text-white font-semibold">{orderedService.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Paiement :</span>
                    <span className="text-emerald-400 font-semibold">Déduit de votre Portefeuille MoMo</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-semibold block">Précisions ou instructions pour notre équipe *</label>
                  <textarea
                    rows={3}
                    placeholder="Indiquez le titre du projet, les liens audio ou vos attentes particulières..."
                    value={artistNotes}
                    onChange={(e) => setArtistNotes(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-congo-green"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOrderedService(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={isOrdering}
                    onClick={handleConfirmOrder}
                    className="px-6 py-2.5 bg-congo-green hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition shadow-lg disabled:opacity-50"
                  >
                    {isOrdering ? <span>Traitement MoMo en cours...</span> : <span>Confirmer la Commande 🚀</span>}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Commande Validée avec Succès !</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Votre demande pour <strong>"{orderedService.title}"</strong> a été prise en compte. Un chef de projet Moyo Culture vous contactera sous 24h sur votre numéro MoMo.
                </p>
                <button
                  onClick={() => setOrderedService(null)}
                  className="px-6 py-2.5 bg-congo-green hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg transition"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
