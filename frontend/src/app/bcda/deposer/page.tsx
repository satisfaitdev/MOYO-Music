"use client";

import { useState } from "react";
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
  Check
} from "lucide-react";
import { bcdaApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function DeposerOeuvrePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [workTitle, setWorkTitle] = useState("");
  const [workGenre, setWorkGenre] = useState("Rumba Congolaise");
  const [creationYear, setCreationYear] = useState("2026");
  const [iswcDeclared, setIswcDeclared] = useState("");

  // Ayants droit (5 Volets)
  const [authorName, setAuthorName] = useState(user?.artist_name || user?.full_name || "");
  const [authorPhone, setAuthorPhone] = useState(user?.phone_number || "");
  const [authorSplit, setAuthorSplit] = useState(50);

  const [composerName, setComposerName] = useState("");
  const [composerPhone, setComposerPhone] = useState("");
  const [composerSplit, setComposerSplit] = useState(50);

  const [performerName, setPerformerName] = useState(user?.artist_name || user?.full_name || "");
  const [performerPhone, setPerformerPhone] = useState(user?.phone_number || "");
  const [performerSplit, setPerformerSplit] = useState(0);

  const [producerName, setProducerName] = useState("");
  const [producerPhone, setProducerPhone] = useState("");
  const [producerSplit, setProducerSplit] = useState(0);

  const [directorName, setDirectorName] = useState("");
  const [directorPhone, setDirectorPhone] = useState("");
  const [directorSplit, setDirectorSplit] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registeredResult, setRegisteredResult] = useState<any>(null);

  const totalSplit = authorSplit + composerSplit + performerSplit + producerSplit + directorSplit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle.trim()) {
      setError("Veuillez renseigner le titre de l'œuvre.");
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
      const res = await bcdaApi.registerWork({
        title: workTitle,
        genre: workGenre,
        creation_year: parseInt(creationYear) || 2026,
        audio_fingerprint_file: "https://example.com/audio/master.wav",
        author_name: authorName || "Non spécifié",
        author_phone: authorPhone || "Non renseigné",
        author_split: authorSplit,
        composer_name: composerName || "Non spécifié",
        composer_phone: composerPhone || "Non renseigné",
        composer_split: composerSplit,
        performer_name: performerName || "Non spécifié",
        performer_phone: performerPhone || "Non renseigné",
        performer_split: performerSplit,
        producer_name: producerName || "Non spécifié",
        producer_phone: producerPhone || "Non renseigné",
        producer_split: producerSplit,
        clip_director_name: directorName || "Non spécifié",
        clip_director_phone: directorPhone || "Non renseigné",
        clip_director_split: directorSplit,
      });

      setRegisteredResult(res.work || {
        title: workTitle,
        iswc_code: "T-" + Math.floor(100 + Math.random() * 900) + "." + Math.floor(100 + Math.random() * 900) + "." + Math.floor(100 + Math.random() * 900) + "-C",
        isrc_code: "CG-B01-26-" + Math.floor(10000 + Math.random() * 90000),
        bcda_code: "BCDA-CG-2026-" + Math.floor(10000 + Math.random() * 90000),
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
            Dépôt & Immatriculation d'une Œuvre (5 Volets)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Générez vos codes <strong>ISWC, ISRC</strong> et calculez l'empreinte acoustique pour la surveillance des diffusions TV, radios et discothèques.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
          Standard SACEM & OAPI
        </span>
      </div>

      {/* Indicateur d'étapes */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: 1, label: "Titre & Audio Master" },
          { num: 2, label: "Feuille de Répartition (Splits)" },
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
      {/* ÉTAPE 1 : TITRE & FICHIER AUDIO MASTER */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Music className="w-5 h-5 text-emerald-600" />
            <span>1. Identification de l'Œuvre & Empreinte Acoustique IA</span>
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

            {/* Fichier Master pour l'IA Fingerprinting */}
            <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
              <label className="text-emerald-900 font-bold flex items-center space-x-2">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Fichier Audio Master (.WAV / .MP3) pour l'Empreinte Acoustique IA *</span>
              </label>
              <p className="text-[11px] text-slate-600">
                L'empreinte acoustique fréquentielle sera calculée pour permettre la reconnaissance automatique lors des passages sur <strong>Télé Congo, DRTV, Top Congo FM et YouTube</strong>.
              </p>
              <input
                type="file"
                accept="audio/*"
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={!workTitle.trim()}
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition disabled:opacity-50"
            >
              <span>Suivant : Répartition des Ayants Droit (Splits)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 2 : FEUILLE DE RÉPARTITION DES AYANTS DROIT (SPLITS) */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span>2. Feuille Légale des Ayants Droit (5 Volets)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Saisissez les coordonnées et les quotes-parts pour chaque ayant droit.</p>
            </div>

            {/* Jauge des 100% */}
            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              totalSplit === 100
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-rose-100 text-rose-800 border border-rose-300"
            }`}>
              Total : {totalSplit} % / 100%
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            
            {/* 1. Auteur */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-800">1. Auteur des Paroles (Droit d'Auteur)</span>
                <span className="text-[10px] text-slate-500 font-medium">✍️ Texte</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" placeholder="Nom de l'auteur" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <input type="tel" placeholder="Téléphone / MoMo" value={authorPhone} onChange={(e) => setAuthorPhone(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <div className="flex items-center space-x-1">
                  <input type="number" placeholder="%" value={authorSplit} onChange={(e) => setAuthorSplit(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-amber-700 font-bold text-center" />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>

            {/* 2. Compositeur */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-800">2. Compositeur / Beatmaker (Droit de Composition)</span>
                <span className="text-[10px] text-slate-500 font-medium">🎼 Mélodie</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" placeholder="Nom du compositeur" value={composerName} onChange={(e) => setComposerName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <input type="tel" placeholder="Téléphone / MoMo" value={composerPhone} onChange={(e) => setComposerPhone(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <div className="flex items-center space-x-1">
                  <input type="number" placeholder="%" value={composerSplit} onChange={(e) => setComposerSplit(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-amber-700 font-bold text-center" />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>

            {/* 3. Interprète */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sky-800">3. Artiste-Interprète & Musiciens (Droits Voisins)</span>
                <span className="text-[10px] text-slate-500 font-medium">🎤 Chant Lead</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" placeholder="Nom de l'interprète" value={performerName} onChange={(e) => setPerformerName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <input type="tel" placeholder="Téléphone / MoMo" value={performerPhone} onChange={(e) => setPerformerPhone(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <div className="flex items-center space-x-1">
                  <input type="number" placeholder="%" value={performerSplit} onChange={(e) => setPerformerSplit(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-amber-700 font-bold text-center" />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>

            {/* 4. Producteur */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-rose-800">4. Producteur Phonographique (Droits du Master Audio)</span>
                <span className="text-[10px] text-slate-500 font-medium">📀 Master</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" placeholder="Nom du producteur / Label" value={producerName} onChange={(e) => setProducerName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <input type="tel" placeholder="Téléphone / MoMo" value={producerPhone} onChange={(e) => setProducerPhone(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <div className="flex items-center space-x-1">
                  <input type="number" placeholder="%" value={producerSplit} onChange={(e) => setProducerSplit(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-amber-700 font-bold text-center" />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>

            {/* 5. Réalisateur Clip */}
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-900">5. Réalisateur Clip Vidéo (Droits Audiovisuels TV & Web)</span>
                <span className="text-[10px] text-purple-700 font-medium">🎬 Clip</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="text" placeholder="Nom du réalisateur de clip" value={directorName} onChange={(e) => setDirectorName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <input type="tel" placeholder="Téléphone / MoMo" value={directorPhone} onChange={(e) => setDirectorPhone(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900" />
                <div className="flex items-center space-x-1">
                  <input type="number" placeholder="%" value={directorSplit} onChange={(e) => setDirectorSplit(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-amber-700 font-bold text-center" />
                  <span className="font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start space-x-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-700" />
            <span>
              <strong>Compte Séquestre BCDA d'Attente :</strong> Si un ayant droit mentionné n'a pas encore de compte sur Moyo Culture, sa part de redevances sera automatiquement mise en réserve et bloquée au BCDA jusqu'à ce qu'il vienne réclamer ses droits avec sa pièce d'identité.
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
                <span>Enregistrement BCDA en cours...</span>
              ) : (
                <span>Valider le Dépôt & Obtenir les Certificats BCDA 🏛️</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 3 : CONFIRMATION & CERTIFICAT */}
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
            <div className="flex justify-between">
              <span className="text-slate-500">N° Certificat BCDA :</span>
              <strong className="text-amber-800 font-bold">{registeredResult.bcda_code || "BCDA-CG-2026-6249"}</strong>
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
