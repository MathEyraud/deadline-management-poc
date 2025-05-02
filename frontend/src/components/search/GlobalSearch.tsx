/**
 * Composant de recherche globale
 * Permet de rechercher dans toutes les entités de l'application
 * @module components/search/GlobalSearch
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, XCircle, Calendar, ListTodo, Users, FolderKanban, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHybridSearch } from '@/hooks/useHybridSearch';
import { useClickAway } from '@/hooks/useClickAway';
import { useHotkeys } from '@/hooks/useHotkeys';

/**
 * Composant de recherche globale
 * @returns Composant GlobalSearch
 */
const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  
  // Hook personnalisé pour gérer la recherche
  const { 
    results, 
    isLoading, 
    isLocalOnly,
    category, 
    setCategory 
  } = useHybridSearch(query);
  
  // Fermer les résultats si on clique ailleurs
  // Exclure explicitement le bouton de suppression de query
  useClickAway([inputRef, resultsRef, buttonRef, clearButtonRef], () => {
    setIsOpen(false);
  });
  
  // Raccourci clavier pour ouvrir la recherche
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  });
  
  // Raccourci Échap pour fermer
  useHotkeys('escape', (e) => {
    if (isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  });
  
  // Effets pour gérer l'ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('search-open');
      inputRef.current?.focus();
    } else {
      document.body.classList.remove('search-open');
      // Ne pas effacer la requête lors de la fermeture
      // setQuery(''); // Cette ligne est commentée pour éviter d'effacer query à la fermeture
    }
    
    return () => {
      document.body.classList.remove('search-open');
    };
  }, [isOpen]);
  
  // Fonction pour effacer le texte sans fermer la recherche
  const handleClearQuery = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery('');
    // S'assurer que le focus reste sur l'input
    setTimeout(() => inputRef.current?.focus(), 10);
  };
  
  // Fonction pour fermer la recherche
  const handleCloseSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };
  
  // Grouper les résultats par type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);
  
  // Navigation vers un résultat
  const navigateToResult = (url: string) => {
    router.push(url);
    setIsOpen(false);
  };
  
  // Icônes par type d'entité
  const typeIcons = {
    deadline: <ListTodo className="h-4 w-4 mr-2" />,
    project: <FolderKanban className="h-4 w-4 mr-2" />,
    team: <Users className="h-4 w-4 mr-2" />,
    user: <Users className="h-4 w-4 mr-2" />,
    document: <FileText className="h-4 w-4 mr-2" />,
  };
  
  // Étiquettes pour les types d'entités
  const typeLabels = {
    deadline: 'Échéances',
    project: 'Projets',
    team: 'Équipes',
    user: 'Utilisateurs',
    document: 'Documents',
  };

  // Déterminer le raccourci clavier approprié à la plateforme
  const shortcutText = navigator.platform.indexOf('Mac') !== -1 ? '⌘K' : 'Ctrl+K';
  
  return (
    <>
      {/* Bouton de recherche */}
      <button
        ref={buttonRef}
        className="relative flex items-center w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100"
        onClick={() => setIsOpen(true)}
        aria-label="Recherche globale"
      >
        <Search className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="truncate">Rechercher...</span>
        <span className="ml-auto hidden md:flex items-center text-xs text-slate-400 border border-slate-300 rounded px-1.5">
          {shortcutText}
        </span>
      </button>
      
      {/* Overlay de recherche */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
            {/* Conteneur de recherche */}
            <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
              {/* Barre de recherche */}
              <div className="flex items-center px-4 py-3 border-b border-slate-200">
                <Search className="h-5 w-5 text-slate-500 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher dans l'application..."
                  className="flex-1 border-0 bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
                {query && (
                  <button
                    ref={clearButtonRef}
                    className="text-slate-500 hover:text-slate-700 mr-1"
                    onClick={handleClearQuery}
                    aria-label="Effacer la recherche"
                    title="Effacer le texte"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
                <button
                  className="ml-2 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-300 rounded flex items-center"
                  onClick={handleCloseSearch}
                  aria-label="Fermer la recherche"
                  title="Fermer (Esc)"
                >
                  <span className="mr-1">Esc</span>
                  <X className="h-3 w-3" />
                </button>
              </div>
              
              {/* Résultats de recherche */}
              <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
                {/* Filtres de catégories */}
                {query && (
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 overflow-x-auto">
                    <button
                      className={`px-2 py-1 rounded text-sm whitespace-nowrap ${
                        category === 'all' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      onClick={() => setCategory('all')}
                    >
                      Tout
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-sm flex items-center whitespace-nowrap ${
                        category === 'deadlines' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      onClick={() => setCategory('deadlines')}
                    >
                      <ListTodo className="h-3 w-3 mr-1" />
                      Échéances
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-sm flex items-center whitespace-nowrap ${
                        category === 'projects' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      onClick={() => setCategory('projects')}
                    >
                      <FolderKanban className="h-3 w-3 mr-1" />
                      Projets
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-sm flex items-center whitespace-nowrap ${
                        category === 'teams' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      onClick={() => setCategory('teams')}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Équipes
                    </button>
                  </div>
                )}
                
                {/* Zone de résultats */}
                <div className="p-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : query ? (
                    results.length > 0 ? (
                      <div className="space-y-6">
                        {/* Groupe de résultats par type */}
                        {Object.entries(groupedResults).map(([type, items]) => (
                          <div key={type}>
                            <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center">
                              {typeIcons[type as keyof typeof typeIcons]}
                              {typeLabels[type as keyof typeof typeLabels]}
                            </h3>
                            <div className="space-y-1">
                              {items.map(result => (
                                <button
                                  key={result.id}
                                  className="w-full text-left p-2 rounded hover:bg-slate-100 flex items-start"
                                  onClick={() => navigateToResult(result.url)}
                                >
                                  <div className="w-full">
                                    <div className="font-medium text-slate-900">{result.title}</div>
                                    {result.description && (
                                      <div className="text-sm text-slate-500 mt-0.5 break-words whitespace-normal overflow-hidden">{result.description}</div>
                                    )}
                                    {result.source === 'local' && isLocalOnly && (
                                      <span className="inline-flex items-center mt-1 text-xs text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
                                        Résultat local
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {isLocalOnly && (
                          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
                            Recherche en cours sur le serveur...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        Aucun résultat trouvé pour "{query}"
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Commencez à taper pour rechercher
                      <div className="mt-2 text-sm text-slate-400">
                        Recherchez des échéances, projets, équipes, utilisateurs...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;