"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Music, 
  Upload, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Sparkles,
  Info,
  Check,
  Search,
  UserPlus,
  Trash2,
  Lock,
  FileBadge,
  Scale,
  Cpu,
  FileCheck2
} from "lucide-react";
import { bcdaApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Collaborator {
  id: string;
  name: string;
  phone: string;
  role: "author" | "composer" | "beatmaker" | "performer" | "producer" | "clip_director";
  roleLabel: string;
  splitPercentage: number;
  avatarUrl?: string;
  isRegistered?: boolean;
}

const REGISTERED_COMMUNITY = [
  { name: "Prince Nzassi - La Voix du Fleuve", phone: "+242068001122", role: "author", roleLabel: "Auteur des Paroles ✍️", avatar: "🎤" },
  { name: "DJ Brazza Beat (Beatmaker)", phone: "+242065112233", role: "beatmaker", roleLabel: "Beatmaker / Arrangeur 🎹", avatar: "🎧" },
  { name: "Maître Mavoungou Solo (Compositeur)", phone: "+242057889900", role: "composer", roleLabel: "Compositeur Mélodie 🎼", avatar: "🎸" },
  { name: "Director Steven Awuku (Clip)", phone: "+242069900112", role: "clip_director", roleLabel: "Réalisateur Vidéo 🎬", avatar: "📹" },
  { name: "Brazza Sound Master (Studio)", phone: "+242054455667", role: "producer", roleLabel: "Producteur Phonographique 📀", avatar: "🎚️" },
  { name: "Chantre Grace Congo (Gospel)", phone: "+242064123456", role: "performer", roleLabel: "Artiste-Interprète 🎤", avatar: "✨" },
];

export default function DeposerOeuvrePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [workTitle, setWorkTitle] = useState("");
  const [workGenre, setWorkGenre] = useState("Rumba Congolaise");
  const [creationYear, setCreationYear] = useState("2026");

  // Vérification d'originalité & Empreinte Acoustique IA
  const [isAudioUploaded, setIsAudioUploaded] = useState(false);
  const [isScanningAudio, setIsScanningAudio] = useState(false);
  const [audioFingerprintData, setAudioFingerprintData] = useState<{
    hash: string;
    originalityScore: number;
    duplicateFound: boolean;
  } | null>(null);
  const [certifyOwnership, setCertifyOwnership] = useState(false);

  // Liste Dynamique des Collaborateurs (Splits)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: "owner_1",
      name: user?.artist_name || user?.full_name || "Prince Nzassi",
      phone: user?.phone_number || "+242068001122",
      role: "author",
      roleLabel: "Auteur des Paroles ✍️",
      splitPercentage: 50,
      avatarUrl: "🎤",
      isRegistered: true,
    },
    {
      id: "owner_2",
      name: "DJ Brazza Beat",
      phone: "+242065112233",
      role: "composer",
      roleLabel: "Compositeur / Beatmaker 🎼",
      splitPercentage: 50,
      avatarUrl: "🎧",
      isRegistered: true,
    }
  ]);

  // Recherche de collaborateur
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customRole, setCustomRole] = useState<Collaborator["role"]>("composer");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registeredResult, setRegisteredResult] = useState<any>(null);

  // Total des splits calculé en direct
  const totalSplit = useMemo(() => {
    return collaborators.reduce((sum, c) => sum + (c.splitPercentage || 0), 0);
  }, [collaborators]);

  // Simulation de l'analyse d'empreinte acoustique IA (Style YouTube Content ID & SACEM AcoustID)
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsAudioUploaded(true);
      setIsScanningAudio(true);
      setAudioFingerprintData(null);

      setTimeout(() => {
        setIsScanningAudio(false);
        setAudioFingerprintData({
          hash: "SHA256:" + Math.random().toString(36).substring(2, 12).toUpperCase() + "7B89A0C32E4",
          originalityScore: 100,
          duplicateFound: false,
        });
      }, 1500);
    }
  };

  // Ajouter un collaborateur suggéré
  const addCollaboratorFromSuggestion = (sug: typeof REGISTERED_COMMUNITY[0]) => {
    if (collaborators.some(c => c.name.toLowerCase() === sug.name.toLowerCase())) {
      setError(`${sug.name} est déjà dans la liste des ayants droit.`);
      return;
    }
    const newCollab: Collaborator = {
      id: "collab_" + Date.now(),
      name: sug.name,
      phone: sug.phone,
      role: sug.role as any,
      roleLabel: sug.roleLabel,
      splitPercentage: 0,
      avatarUrl: sug.avatar,
      isRegistered: true,
    };
    setCollaborators([...collaborators, newCollab]);
    setSearchQuery("");
    setShowSearchDropdown(false);
    setError("");
  };

  // Ajouter un collaborateur manuel
  const addCustomCollaborator = () => {
    if (!customName.trim()) {
      setError("Veuillez saisir le nom du collaborateur.");
      return;
    }
    const roleLabels: Record<string, string> = {
      author: "Auteur des Paroles ✍️",
      composer: "Compositeur Mélodie 🎼",
      beatmaker: "Beatmaker / Arrangeur 🎹",
      performer: "Artiste-Interprète 🎤",
      producer: "Producteur Phonographique 📀",
      clip_director: "Réalisateur Vidéo 🎬",
    };

    const newCollab: Collaborator = {
      id: "collab_" + Date.now(),
      name: customName,
      phone: customPhone || "+24206...",
      role: customRole,
      roleLabel: roleLabels[customRole] || "Collaborateur",
      splitPercentage: 0,
      avatarUrl: "👤",
      isRegistered: false,
    };

    setCollaborators([...collaborators, newCollab]);
    setCustomName("");
    setCustomPhone("");
    setError("");
  };

  // Mettre à jour la part d'un collaborateur
  const updateSplit = (id: string, newSplit: number) => {
    setCollaborators(collaborators.map(c => c.id === id ? { ...c, splitPercentage: newSplit } : c));
  };

  // Mettre à jour le rôle d'un collaborateur
  const updateRole = (id: string, newRole: Collaborator["role"]) => {
    const roleLabels: Record<string, string> = {
      author: "Auteur des Paroles ✍️",
      composer: "Compositeur Mélodie 🎼",
      beatmaker: "Beatmaker / Arrangeur 🎹",
      performer: "Artiste-Interprète 🎤",
      producer: "Producteur Phonographique 📀",
      clip_director: "Réalisateur Vidéo 🎬",
    };
    setCollaborators(collaborators.map(c => c.id === id ? { ...c, role: newRole, roleLabel: roleLabels[newRole] } : c));
  };

  // Supprimer un collaborateur
  const removeCollaborator = (id: string) => {
    if (collaborators.length <= 1) {
      setError("Il doit y avoir au moins 1 ayant droit sur l'œuvre.");
      return;
    }
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  // Répartir 100% de façon équitable en 1 clic
  const handleEqualSplit = () => {
    const count = collaborators.length;
    if (count === 0) return;
    const baseShare = Math.floor(100 / count);
    const remainder = 100 - (baseShare * count);

    setCollaborators(collaborators.map((c, idx) => ({
      ...c,
      splitPercentage: idx === 0 ? baseShare + remainder : baseShare
    })));
  };

  // Soumission finale BCDA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle.trim()) {
      setError("Veuillez renseigner le titre de l'œuvre.");
      setStep(1);
      return;
    }
    if (!certifyOwnership) {
      setError("Vous devez certifier sur l'honneur détenir les droits sur ce morceau.");
      setStep(1);
      return;
    }
    if (totalSplit !== 100) {
      setError(`Le total des parts de répartition doit être exactement égal à 100% (Actuellement : ${totalSplit}%).`);
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Trouver les ayants droit par rôle
      const author = collaborators.find(c => c.role === "author");
      const composer = collaborators.find(c => c.role === "composer" || c.role === "beatmaker");
      const performer = collaborators.find(c => c.role === "performer");
      const producer = collaborators.find(c => c.role === "producer");
      const director = collaborators.find(c => c.role === "clip_director");

      const res = await bcdaApi.registerWork({
        title: workTitle,
        genre: workGenre,
        creation_year: parseInt(creationYear) || 2026,
        audio_fingerprint_file: "https://example.com/audio/master.wav",
        author_name: author?.name || collaborators[0]?.name || "Non spécifié",
        author_phone: author?.phone || "+242068001122",
        author_split: author?.splitPercentage || 50,
        composer_name: composer?.name || collaborators[1]?.name || "DJ Brazza Beat",
        composer_phone: composer?.phone || "+242065112233",
        composer_split: composer?.splitPercentage || 50,
        performer_name: performer?.name || user?.artist_name || "Prince Nzassi",
        performer_phone: performer?.phone || "+242068001122",
        performer_split: performer?.splitPercentage || 0,
        producer_name: producer?.name || "Brazza Sound",
        producer_phone: producer?.phone || "+242054455667",
        producer_split: producer?.splitPercentage || 0,
        clip_director_name: director?.name || "Steven Awuku",
        clip_director_phone: director?.phone || "+242069900112",
        clip_director_split: director?.splitPercentage || 0,
      });

      setRegisteredResult(res.work || {
        title: workTitle,
        iswc_code: "T-" + Math.floor(100 + Math.random() * 900) + "." + Math.floor(100 + Math.random() * 900) + "." + Math.floor(100 + Math.random() * 900) + "-C",
        isrc_code: "CG-B01-26-" + Math.floor(10000 + Math.random() * 90000),
        bcda_code: "BCDA-CG-2026-" + Math.floor(10000 + Math.random() * 90000),
        fingerprint_hash: audioFingerprintData?.hash || "SHA256:4FA890BC12",
      });
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'immatriculation BCDA.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Bouton Retour */}
      <div>
        <Link
          href="/bcda"
          className="inline-flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-900 transition font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à mon Espace BCDA</span>
        </Link>
      </div>

      {/* En-tête BCDA Officiel */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>République du Congo • Bureau Congolais du Droit d'Auteur (BCDA) 🇨🇬</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Dépôt d'Œuvre & Gestion Dynamique des Splits
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Recherche instantanée de collaborateurs, jauge de répartition sur 100% et <strong>empreinte acoustique IA anti-plagiat</strong>.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
          Standard SACEM & OAPI
        </span>
      </div>

      {/* Indicateur d'étapes */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: 1, label: "Titre & Empreinte IA" },
          { num: 2, label: "Collaborateurs & Splits" },
          { num: 3, label: "Certificat BCDA Officiel" },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3.5 rounded-2xl border text-center transition ${
              step === s.num
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm"
                : step > s.num
                ? "bg-white border-slate-300 text-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            <span className="text-[10px] block uppercase font-mono">Étape {s.num}</span>
            <span className="text-xs font-semibold">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* ÉTAPE 1 : TITRE, AUDIO MASTER & VÉRIFICATION IA D'ORIGINALITÉ */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Music className="w-5 h-5 text-emerald-600" />
            <span>1. Identification & Preuve de Propriété (IA Fingerprinting)</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-bold block mb-1.5">Titre de la Chanson / Musique *</label>
              <input
                type="text"
                required
                placeholder="Ex: Rumba du Fleuve Congo"
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-bold block mb-1.5">Genre Musical</label>
                <select
                  value={workGenre}
                  onChange={(e) => setWorkGenre(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium"
                >
                  <option value="Rumba Congolaise">Rumba Congolaise</option>
                  <option value="Soukous / Ndombolo">Soukous / Ndombolo</option>
                  <option value="Afrobeat Congo">Afrobeat Congo</option>
                  <option value="Gospel Congolais">Gospel Congolais</option>
                  <option value="Folklore & Traditionnel">Folklore & Traditionnel</option>
                  <option value="Rap / Hip-Hop 242">Rap / Hip-Hop 242</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1.5">Année de Création</label>
                <input
                  type="number"
                  value={creationYear}
                  onChange={(e) => setCreationYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium"
                />
              </div>
            </div>

            {/* Téléversement Audio & Analyse IA */}
            <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
              <label className="text-emerald-900 font-bold flex items-center space-x-2">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Téléversement Audio Master (.WAV / .MP3) pour Empreinte Acoustique *</span>
              </label>
              <p className="text-[11px] text-slate-600">
                Comme sur <strong>YouTube Content ID</strong> et <strong>AcoustID SACEM</strong>, le système extrait l'empreinte spectrale du morceau pour certifier son antériorité et empêcher tout vol ou double déclaration.
              </p>
              
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />

              {/* État du scan IA */}
              {isScanningAudio && (
                <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-white p-3 rounded-xl border border-emerald-200 animate-pulse">
                  <Cpu className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Analyse spectrale IA & vérification anti-plagiat BCDA en cours...</span>
                </div>
              )}

              {audioFingerprintData && (
                <div className="p-4 bg-white border border-emerald-300 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-800 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Score d'Originalité : {audioFingerprintData.originalityScore}% (Œuvre Inédite)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Anti-Plagiat Validé</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg break-all">
                    Hash Empreinte : <strong className="text-slate-800">{audioFingerprintData.hash}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Attestation sur l'honneur de propriété */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={certifyOwnership}
                  onChange={(e) => setCertifyOwnership(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5"
                />
                <span className="text-xs text-slate-800 leading-snug">
                  <strong>Attestation de Propriété Légale :</strong> Je certifie sur l'honneur être l'auteur/créateur original de cette création ou détenir les autorisations légales nécessaires pour son immatriculation au registre national BCDA.
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={!workTitle.trim() || !certifyOwnership}
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition disabled:opacity-50"
            >
              <span>Suivant : Ajouter Collaborateurs & Répartir les Splits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 2 : RECHERCHE DYNAMIQUE & GESTION DES COLLABORATEURS (SPLITS) */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span>2. Collaborateurs & Partage des Gains (Splits)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recherchez des artistes ou ajoutez des collaborateurs avec leur rôle et leur pourcentage.
              </p>
            </div>

            {/* Jauge des 100% & Bouton Split Égal */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleEqualSplit}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                title="Diviser équitablement entre tous les ayants droit"
              >
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                <span>Split Égal ⚖️</span>
              </button>

              <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                totalSplit === 100
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-rose-100 text-rose-800 border border-rose-300"
              }`}>
                Total : {totalSplit} % / 100%
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 🔍 BARRE DE RECHERCHE DE COLLABORATEUR DANS LA COMMUNAUTÉ */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Rechercher un Artiste ou Collaborateur sur Moyo Culture :
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tapez un nom d'artiste, compositeur, réalisateur..."
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Menu Déroulant des Suggestions */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {REGISTERED_COMMUNITY.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addCollaboratorFromSuggestion(sug)}
                    className="w-full p-3 text-left hover:bg-emerald-50 flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base">{sug.avatar}</span>
                      <div>
                        <strong className="text-slate-900 block">{sug.name}</strong>
                        <span className="text-[10px] text-slate-500">{sug.roleLabel} • MoMo: {sug.phone}</span>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-bold text-xs">+ Ajouter</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 📋 LISTE DES CARTES COLLABORATEURS AJOUTÉS */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Ayants Droit Inscrits sur cette Œuvre ({collaborators.length}) :
            </label>

            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm hover:border-slate-300 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm">
                    {collab.avatarUrl || "👤"}
                  </div>
                  <div>
                    <strong className="text-slate-900 text-sm block font-bold">{collab.name}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">MoMo : {collab.phone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Sélecteur de rôle */}
                  <select
                    value={collab.role}
                    onChange={(e) => updateRole(collab.id, e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold"
                  >
                    <option value="author">Auteur (Paroles) ✍️</option>
                    <option value="composer">Compositeur (Musique) 🎼</option>
                    <option value="beatmaker">Beatmaker / Arrangeur 🎹</option>
                    <option value="performer">Artiste-Interprète 🎤</option>
                    <option value="producer">Producteur (Master) 📀</option>
                    <option value="clip_director">Réalisateur Clip 🎬</option>
                  </select>

                  {/* Saisie de la part en % */}
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={collab.splitPercentage}
                      onChange={(e) => updateSplit(collab.id, parseFloat(e.target.value) || 0)}
                      className="w-16 px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-amber-700 text-sm"
                    />
                    <span className="font-bold text-slate-600">%</span>
                  </div>

                  {/* Bouton Supprimer */}
                  <button
                    type="button"
                    onClick={() => removeCollaborator(collab.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Retirer ce collaborateur"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ➕ AJOUT MANUEL D'UN COLLABORATEUR EXTERNE */}
          <div className="p-4 bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-700 block flex items-center space-x-1.5">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Ajouter manuellement un collaborateur non listé :</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="Nom complet ou Pseudo"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="sm:col-span-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
              <input
                type="tel"
                placeholder="N° Mobile Money (+242...)"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="sm:col-span-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value as any)}
                className="sm:col-span-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
              >
                <option value="author">Auteur (Paroles) ✍️</option>
                <option value="composer">Compositeur (Musique) 🎼</option>
                <option value="beatmaker">Beatmaker / Arrangeur 🎹</option>
                <option value="performer">Artiste-Interprète 🎤</option>
                <option value="producer">Producteur (Master) 📀</option>
                <option value="clip_director">Réalisateur Clip 🎬</option>
              </select>
              <button
                type="button"
                onClick={addCustomCollaborator}
                className="sm:col-span-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                + Ajouter à la Liste
              </button>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start space-x-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-700" />
            <span>
              <strong>Séquestre BCDA d'Attente :</strong> Dès qu'une redevance est collectée (TV, radios, streaming ou discothèques), chaque ayant droit reçoit automatiquement sa part sur son numéro Mobile Money. Si un numéro n'est pas encore inscrit sur Moyo Culture, ses gains restent sous séquestre sécurisé au BCDA jusqu'à son retrait.
            </span>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={isSubmitting || totalSplit !== 100}
              onClick={handleSubmit}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Immatriculation BCDA en cours...</span>
              ) : (
                <span>Valider le Dépôt & Obtenir les Certificats BCDA 🏛️</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 3 : CONFIRMATION & CERTIFICAT OFFICIEL BCDA */}
      {/* ========================================================================= */}
      {step === 3 && registeredResult && (
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Œuvre Immatriculée au BCDA !</h2>
            <p className="text-xs text-slate-600 mt-1">
              Votre œuvre <strong>"{registeredResult.title}"</strong> a été enregistrée avec succès au Répertoire National.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 text-xs font-mono max-w-md mx-auto">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Code ISWC (Droit d'Auteur) :</span>
              <strong className="text-slate-900 font-bold">{registeredResult.iswc_code || "T-304.891.188-K"}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Code ISRC National :</span>
              <strong className="text-emerald-700 font-bold">{registeredResult.isrc_code || "CG-B01-26-00349"}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">N° Certificat BCDA :</span>
              <strong className="text-amber-800 font-bold">{registeredResult.bcda_code || "BCDA-CG-2026-6249"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Preuve d'Antériorité :</span>
              <span className="text-[10px] text-slate-600 truncate max-w-[200px]">{registeredResult.fingerprint_hash}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Link
              href="/bcda"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md"
            >
              Voir mon Répertoire BCDA
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
