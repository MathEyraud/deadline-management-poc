/**
 * Page de liste des équipes
 * Affiche toutes les équipes avec options de filtrage et création
 * @module app/dashboard/teams/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Input, Button, Select } from '@/components/ui';
import { useTeamsList } from '@/hooks/useTeams';
import Link from 'next/link';

/**
 * Page liste des équipes
 * @returns Page listant les équipes avec filtres
 */
export default function TeamsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Utilisation du hook personnalisé pour récupérer les équipes
  const { data: allTeams = [], isLoading } = useTeamsList({
    department: departmentFilter || undefined,
    search: searchTerm || undefined,
  });

  // Filtrage côté client pour garantir que les filtres fonctionnent même si l'API ne les traite pas correctement
  const teams = React.useMemo(() => {
    let result = [...allTeams];
    
    // Filtrage par terme de recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(team => 
        team.name.toLowerCase().includes(search) || 
        (team.description && team.description.toLowerCase().includes(search))
      );
    }
    
    // Filtrage par département
    if (departmentFilter) {
      result = result.filter(team => team.department === departmentFilter);
    }
    
    return result;
  }, [allTeams, searchTerm, departmentFilter]);

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    setDepartmentFilter('');
    setSearchTerm('');
  };

  // Liste unique des départements pour le filtre
  const departments = Array.from(
    new Set(teams.map(team => team.department).filter(Boolean))
  );

  return (
    <>
      <PageHeader
        title="Équipes"
        description="Gérez et suivez vos équipes"
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/dashboard/teams/create')}
          >
            Nouvelle équipe
          </Button>
        }
      />

      {/* Section de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une équipe..."
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtres
              </Button>
              
              {(departmentFilter || searchTerm) && (
                <Button variant="ghost" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  label="Département"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Tous les départements' },
                    ...departments.map(dept => ({ 
                      value: dept || '', 
                      label: dept || 'Sans département'
                    }))
                  ]}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des équipes */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500 mb-4">Aucune équipe trouvée</p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/teams/create')}
            >
              Créer une équipe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/dashboard/teams/${team.id}`}
              className="block"
            >
              <Card className="h-full transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-semibold line-clamp-2">{team.name}</h3>
                    {team.department && (
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {team.department}
                      </span>
                    )}
                  </div>
                  
                  {team.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {team.description}
                    </p>
                  )}
                  
                  <div className="flex items-center mt-4 text-sm text-slate-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      {team.members?.length || 0} membre{(team.members?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {team.leader && (
                    <p className="text-sm text-slate-500 mt-2">
                      <span className="font-medium">Chef d'équipe:</span> {team.leader.firstName} {team.leader.lastName}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}