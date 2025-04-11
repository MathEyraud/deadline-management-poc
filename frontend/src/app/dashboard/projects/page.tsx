/**
 * Page de liste des projets
 * Affiche tous les projets avec options de filtrage et création
 * @module app/dashboard/projects/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Input, Button, Select, Badge } from '@/components/ui';
import { useProjectsList } from '@/hooks/useProjects';
import { formatDate } from '@/lib/utils';
import { ProjectStatus } from '@/types';
import Link from 'next/link';

/**
 * Page liste des projets
 * @returns Page listant les projets avec filtres
 */
export default function ProjectsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Utilisation du hook personnalisé pour récupérer les projets
  const { data: projects = [], isLoading } = useProjectsList({
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  /**
   * Obtient la variante de badge en fonction du statut du projet
   * @param status - Statut du projet
   * @returns Variante CSS appropriée
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'secondary';
      case ProjectStatus.ACTIVE:
        return 'primary';
      case ProjectStatus.ON_HOLD:
        return 'warning';
      case ProjectStatus.COMPLETED:
        return 'success';
      case ProjectStatus.CANCELLED:
        return 'danger';
      default:
        return 'default';
    }
  };

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
  };

  return (
    <>
      <PageHeader
        title="Projets"
        description="Gérez et suivez vos projets"
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/dashboard/projects/create')}
          >
            Nouveau projet
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
                placeholder="Rechercher un projet..."
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
              
              {(statusFilter || searchTerm) && (
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
                  label="Statut"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Tous les statuts' },
                    { value: ProjectStatus.PLANNING, label: 'Planification' },
                    { value: ProjectStatus.ACTIVE, label: 'Actif' },
                    { value: ProjectStatus.ON_HOLD, label: 'En pause' },
                    { value: ProjectStatus.COMPLETED, label: 'Terminé' },
                    { value: ProjectStatus.CANCELLED, label: 'Annulé' },
                  ]}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des projets */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500 mb-4">Aucun projet trouvé</p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/projects/create')}
            >
              Créer un projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block"
            >
              <Card className="h-full transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold line-clamp-2">{project.name}</h3>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 text-sm text-slate-500">
                    <div className="flex justify-between">
                      <span>Début: {formatDate(project.startDate)}</span>
                      {project.endDate && (
                        <span>Fin: {formatDate(project.endDate)}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}