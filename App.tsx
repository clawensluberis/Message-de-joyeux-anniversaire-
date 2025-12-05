import React, { useState, useEffect } from 'react';
import { Gift, Mail, Sparkles, Copy, Check, RefreshCw, Send, History, Trash2, Eye, Calendar, AlertCircle } from 'lucide-react';
import { Relationship, Tone, BirthdayFormData, GeneratedEmail, HistoryItem } from './types';
import { generateBirthdayWish } from './services/geminiService';
import { Button } from './components/Button';
import { Input, Select, TextArea } from './components/Input';

const App: React.FC = () => {
  const [formData, setFormData] = useState<BirthdayFormData>({
    recipientName: '',
    recipientEmail: '',
    relationship: Relationship.FRIEND,
    tone: Tone.FUNNY,
    details: '',
    age: undefined
  });

  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Charger l'historique au démarrage
  useEffect(() => {
    const savedHistory = localStorage.getItem('birthday_email_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Erreur lors du chargement de l'historique", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('birthday_email_history', JSON.stringify(newHistory));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName) {
      setError("Le nom du destinataire est obligatoire.");
      return;
    }

    // Validation de l'email si renseigné
    if (formData.recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setGeneratedEmail(null);

    try {
      const result = await generateBirthdayWish(formData);
      setGeneratedEmail(result);

      // Ajouter à l'historique
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        subject: result.subject,
        body: result.body,
        formData: { ...formData }
      };
      
      const newHistory = [newItem, ...history];
      saveHistory(newHistory);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur inconnue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setGeneratedEmail({ subject: item.subject, body: item.body });
    setFormData(item.formData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = (text: string, isSubject: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSubject) {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-lg mb-4">
            <Gift className="h-8 w-8 text-pink-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-2">
            Générateur d'Email <span className="gradient-text">d'Anniversaire</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Trouvez les mots parfaits sans effort. Laissez l'IA rédiger un message inoubliable pour vos proches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h2 className="text-xl font-bold text-slate-800">Personnalisez votre message</h2>
            </div>
            
            <form onSubmit={handleGenerate}>
              <Input
                label="Destinataire (Prénom/Nom)"
                placeholder="ex: Marie, Jean Dupont"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                required
              />

              <Input
                label="Email du destinataire (Optionnel)"
                type="email"
                placeholder="ex: marie@example.com"
                value={formData.recipientEmail || ''}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Relation"
                  options={Object.values(Relationship).map(r => ({ value: r, label: r }))}
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value as Relationship })}
                />
                
                <Input
                  label="Âge (Optionnel)"
                  type="number"
                  placeholder="ex: 30"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>

              <Select
                label="Ton du message"
                options={Object.values(Tone).map(t => ({ value: t, label: t }))}
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value as Tone })}
              />

              <TextArea
                label="Détails, souvenirs ou passions (Optionnel)"
                placeholder="ex: Adore le jardinage, on s'est rencontrés à la fac, fan de Star Wars..."
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              />

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 animate-pulse">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">Erreur de génération</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <Button type="submit" isLoading={loading} className="w-full">
                {loading ? 'Rédaction en cours...' : 'Générer l\'email'} <Sparkles className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </div>

          {/* Result Section */}
          <div className="flex flex-col h-full">
            {generatedEmail ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-full animate-fade-in-up">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span className="font-semibold">Email généré</span>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Régénérer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="p-6 sm:p-8 flex-grow flex flex-col gap-6">
                  
                  {/* Subject Line */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Objet</span>
                      <button 
                        onClick={() => copyToClipboard(generatedEmail.subject, true)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Copier l'objet"
                      >
                        {copiedSubject ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-slate-800 font-medium">{generatedEmail.subject}</p>
                  </div>

                  {/* Body */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex-grow relative group">
                     <div className="flex justify-between items-start mb-2 absolute top-4 right-4 z-10">
                      <button 
                        onClick={() => copyToClipboard(generatedEmail.body, false)}
                        className="bg-white p-2 rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                        title="Copier le message"
                      >
                        {copiedBody ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {generatedEmail.body}
                    </div>
                  </div>

                  <div className="text-center">
                     <a 
                       href={`mailto:${formData.recipientEmail || ''}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`}
                       className="inline-flex items-center justify-center w-full px-4 py-3 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 rounded-lg font-bold shadow-sm transition-all duration-200 gap-2"
                     >
                       <Send className="h-5 w-5" /> Envoyer par email
                     </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-slate-300 rounded-2xl h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 min-h-[400px]">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-500">Votre email apparaîtra ici</p>
                <p className="text-sm">Remplissez le formulaire et cliquez sur générer pour commencer la magie.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="h-6 w-6 text-slate-600" />
                <h2 className="text-2xl font-bold text-slate-800">Historique récent</h2>
              </div>
              <button 
                onClick={() => saveHistory([])}
                className="text-sm text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" /> Tout effacer
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100 overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800">{item.formData.recipientName}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                      {item.formData.tone.split(' ')[0]}
                    </span>
                  </div>
                  
                  <div className="p-4 flex-grow">
                    <p className="text-sm font-medium text-slate-700 mb-2 truncate">
                      {item.subject}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-3 whitespace-pre-wrap">
                      {item.body}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between gap-2">
                    <button
                      onClick={() => loadFromHistory(item)}
                      className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" /> Voir / Copier
                    </button>
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-16 text-center text-slate-500 text-sm border-t border-slate-200 pt-8">
          <p>© {new Date().getFullYear()} Générateur d'Email. Propulsé par Gemini AI.</p>
        </footer>

      </div>
    </div>
  );
};

export default App;