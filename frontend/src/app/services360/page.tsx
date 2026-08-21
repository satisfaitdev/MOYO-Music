"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, Youtube, Music2, Check, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Services360Page() {
  const { user } = useAuth();
  const isArtist = user?.role === "artist" || user?.role === "admin";

  const [selectedService, setSelectedService] = useState<any>(null);
  const [channelUrl, setChannelUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);

  const packs = [
    {
      id: "youtube_oac",
      badge: "Indispensable Artiste",
      title: "Chaîne Officielle d'Artiste YouTube (OAC 🎵)",
      desc: "Fusionnez votre chaîne YouTube personnelle avec votre chaîne thématique Topic. Obtenez la note de musique officielle 🎵 à côté de votre nom d'artiste.",
      price: "25 000 FCFA",
      time: "3 à 7 jours",
      features: [
        "Attribution de la note de musique officielle",
        "Regroupement de tous vos clips et albums officiels",
        "Accès aux statistiques détaillées YouTube for Artists",
        "Organisation de la page d'accueil de la chaîne"
      ],
      icon: "youtube"
    },
    {
      id: "tiktok_badge",
      badge: "Viralité & Trends",
      title: "Hub Artiste & Badge Musique TikTok (🎶)",
      desc: "Liez votre compte personnel TikTok à votre discographie officielle. Activez l'onglet 'Musique' sur votre profil pour que vos fans créent des vidéos avec vos sons.",
      price: "20 000 FCFA",
      time: "2 à 5 jours",
      features: [
        "Badge Artiste officiel sur TikTok",
        "Onglet Musique dédié sur votre profil",
        "Épinglage de votre nouveau single en haut de profil",
        "Tag 'Nouveau Morceau' sur vos créations"
      ],
      icon: "tiktok"
    },
    {
      id: "spotify_verified",
      badge: "Crédibilité Mondiale",
      title: "Certification Spotify for Artists (Badge Bleu ✅)",
      desc: "Prenez le contrôle total de votre profil Spotify officiel. Ajoutez votre photo de profil HD, votre bio, vos réseaux sociaux et soumettez vos titres aux playlists.",
      price: "15 000 FCFA",
      time: "24 à 48h",
      features: [
        "Badge de vérification bleu officiel",
        "Pitch direct aux équipes éditoriales Spotify",
        "Personnalisation de la bannière et de la bio",
        "Accès aux données d'écoute en temps réel"
      ],
      icon: "spotify"
    },
    {
      id: "mastering",
      badge: "Qualité Studio",
      title: "Mastering Audio aux Normes Internationales",
      desc: "Optimisation de la dynamique et du volume sonore (-14 LUFS) pour que vos morceaux rivalisent avec les hits mondiaux sur les radios et enceintes.",
      price: "30 000 FCFA",
      time: "48h",
      features: [
        "Ingénieurs du son professionnels partenaires",
        "Fichier Master WAV 24-bit haute fidélité",
        "Égalisation et clarté des voix rumba / afrobeats",
        "2 révisions incluses"
      ],
      icon: "master"
    }
  ];

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdered(true);
  };

  // VERROU STRICT : Si l'utilisateur n'est pas artiste musicien
  if (!user || !isArtist) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-congo-yellow/10 text-congo-yellow rounded-3xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Espace Réservé aux Artistes Musiciens</h1>
        <p className="text-xs text-slate-400">
          L'attribution de chaînes officielles YouTube (OAC 🎵), de badges de musique TikTok et de vérifications Spotify for Artists est réservée aux artistes musiciens.
        </p>
        <p className="text-[11px] text-congo-yellow">
          Votre rôle actuel : <strong>{user ? user.role : "Visiteur non connecté"}</strong>
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 bg-slate-900 border border-slate-700 hover:text-white rounded-xl text-xs inline-block"
          >
            Retourner à l'Accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* En-tête */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-congo-yellow/10 border border-congo-yellow/30 text-xs font-semibold text-congo-yellow mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Accompagnement & Services 360°</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Professionnalisez vos profils d'artiste officiels
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-300">
          Nos équipes techniques s'occupent de toutes les démarches administratives et techniques auprès de YouTube, TikTok, Spotify et Apple pour certifier votre statut d'artiste.
        </p>
      </div>

      {/* Grille des Packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-congo-yellow/50 rounded-3xl p-8 flex flex-col justify-between shadow-xl transition group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-congo-yellow/10 border border-congo-yellow/30 text-congo-yellow rounded-full text-xs font-bold">
                  {pack.badge}
                </span>
                <span className="text-xs text-slate-400">Délai : {pack.time}</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-congo-yellow transition">
                {pack.title}
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {pack.desc}
              </p>

              <div className="space-y-2.5 mb-8 border-t border-slate-800/80 pt-6">
                {pack.features.map((feat, i) => (
                  <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-congo-green flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Tarif du pack :</span>
                <span className="text-2xl font-extrabold text-white">{pack.price}</span>
              </div>

              <button
                onClick={() => {
                  setSelectedService(pack);
                  setIsOrdered(false);
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-congo-yellow hover:text-slate-950 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5"
              >
                <span>Commander</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Commande Directe */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            {isOrdered ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Demande enregistrée !</h3>
                <p className="text-xs text-slate-300">
                  Votre demande pour <strong>{selectedService.title}</strong> a été transmise. Une notification de débit MTN MoMo de <strong>{selectedService.price}</strong> a été envoyée vers le <strong>{phoneNumber}</strong>.
                </p>
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-6 py-2.5 bg-congo-green text-white rounded-xl text-xs font-bold mt-4"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrder} className="space-y-5">
                <div>
                  <span className="text-xs text-congo-yellow font-bold uppercase tracking-wider">Commande Express</span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedService.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedService.desc}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Lien de votre chaîne / profil officiel *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://youtube.com/@monartiste ou @tiktok"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-congo-yellow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Numéro MTN MoMo ou Airtel Money (+242...) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+242 06 XXX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-congo-yellow"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-extrabold text-congo-yellow">{selectedService.price}</span>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-congo-yellow text-slate-950 font-bold rounded-xl text-xs shadow-lg hover:bg-amber-400 transition"
                  >
                    Confirmer & Payer par MoMo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
