/**
 * Hook pour la recherche hybride
 * Combine recherche locale et requêtes backend
 * @module hooks/useHybridSearch
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDeadlinesList } from './useDeadlines';
import { useProjectsList } from './useProjects';
import { useTeamsList } from './useTeams';
import api from '@/lib/api';
import { debounce } from '@/lib/debounce';

/**
 * Interface pour un résultat de recherche
 */
export interface SearchResult {
  id: string;
  type: 'deadline' | 'project' | 'team' | 'user' | 'document';
  title: string;
  description?: string;
  url: string;
  source: 'local' | 'server';
}

/**
 * Hook pour effectuer une recherche hybride
 * @param query - Terme de recherche
 * @returns État et fonctions pour la recherche
 */
export function useHybridSearch(query: string) {
  // Récupérer les données déjà chargées
  const { data: deadlines = [] } = useDeadlinesList();
  const { data: projects = [] } = useProjectsList();
  const { data: teams = [] } = useTeamsList();
  
  // États
  const [results, setResults] = useState<SearchResult[]>([]);
  const [serverResults, setServerResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<string>('all');
  
  // Fonction de recherche dans les données locales
  const searchLocal = useCallback(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const localResults: SearchResult[] = [];
    
    // Recherche dans les échéances
    if (category === 'all' || category === 'deadlines') {
      deadlines.forEach(deadline => {
        if (
          deadline.title.toLowerCase().includes(searchTerm) ||
          (deadline.description && deadline.description.toLowerCase().includes(searchTerm))
        ) {
          localResults.push({
            id: deadline.id,
            type: 'deadline',
            title: deadline.title,
            description: deadline.description || undefined,
            url: `/dashboard/deadlines/${deadline.id}`,
            source: 'local'
          });
        }
      });
    }
    
    // Recherche dans les projets
    if (category === 'all' || category === 'projects') {
      projects.forEach(project => {
        if (
          project.name.toLowerCase().includes(searchTerm) ||
          (project.description && project.description.toLowerCase().includes(searchTerm))
        ) {
          localResults.push({
            id: project.id,
            type: 'project',
            title: project.name,
            description: project.description || undefined,
            url: `/dashboard/projects/${project.id}`,
            source: 'local'
          });
        }
      });
    }
    
    // Recherche dans les équipes
    if (category === 'all' || category === 'teams') {
      teams.forEach(team => {
        if (
          team.name.toLowerCase().includes(searchTerm) ||
          (team.description && team.description.toLowerCase().includes(searchTerm))
        ) {
          localResults.push({
            id: team.id,
            type: 'team',
            title: team.name,
            description: team.description || undefined,
            url: `/dashboard/teams/${team.id}`,
            source: 'local'
          });
        }
      });
    }
    
    setResults(localResults);
  }, [query, category, deadlines, projects, teams]);
  
  // Effet pour la recherche locale
  useEffect(() => {
    searchLocal();
  }, [searchLocal]);
  
  // Recherche côté serveur avec debounce
  const fetchFromServer = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setServerResults([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // TODO : Cette API n'existe pas encore et devra être implémentée côté backend
        const response = await api.get('/search', {
          params: {
            query: searchTerm,
            category: category === 'all' ? undefined : category
          }
        });
        
        // Si la structure de l'API est différente, adapter ce code
        const serverData = response.data.map((item: any) => ({
          ...item,
          source: 'server'
        }));
        
        setServerResults(serverData);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        // En cas d'erreur API, on continue avec juste les résultats locaux
        setServerResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [category]
  );
  
  // Effet pour la recherche serveur
  useEffect(() => {
    if (query.length >= 2) {
      fetchFromServer(query);
    } else {
      setServerResults([]);
    }
  }, [fetchFromServer, query]);
  
  // Combiner les résultats en évitant les doublons
  const combinedResults = useMemo(() => {
    const seen = new Set();
    const combined = [...results];
    
    // Ajouter uniquement les résultats serveur qui ne sont pas déjà présents
    for (const result of serverResults) {
      const key = `${result.type}-${result.id}`;
      if (!seen.has(key)) {
        combined.push(result);
        seen.add(key);
      }
    }
    
    return combined;
  }, [results, serverResults]);
  
  return {
    results: combinedResults,
    isLocalOnly: serverResults.length === 0 && !isLoading,
    isLoading,
    category,
    setCategory
  };
}