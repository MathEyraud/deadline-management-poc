/**
 * Page d'édition d'un projet
 * Formulaire pour modifier un projet existant
 * @module app/dashboard/projects/[id]/edit/page
 */
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Input, Select, Button, DatePicker, Textarea } from '@/components/ui';
import { useProject, useProjectMutations } from '@/hooks/useProjects';
import { useUsersList } from '@/hooks/useUsers';
import { useTeamsList } from '@/hooks/useTeams';
import { useNotifications } from '@/app/providers';
import { ProjectStatus, UpdateProjectDto } from '@/types';

/**
 * Page d'édition d'un projet
 * @param {Object} props - Propriétés de la page
 * @param {Object} props.params - Paramètres de route
 * @param {string} props.params.id - ID du projet
 * @returns Page avec formulaire d'édition de projet
 */
export default function EditProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { showNotification } = useNotifications();
  
  // Récupération des données du projet
  const { data: project, isLoading: isLoadingProject } = useProject(id);
  
  // Récupération des mutations
  const { updateProject, isUpdating } = useProjectMutations();
  
  // Récupération des utilisateurs pour sélectionner un responsable
  const { data: users = [] } = useUsersList();
  
  // Récupération des équipes pour associer au projet
  const { data: teams = [] } = useTeamsList();
  
  // Initialisation du formulaire avec React Hook Form
  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<UpdateProjectDto>();
  
  // Remplir le formulaire avec les données du projet quand elles sont chargées
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description,
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        status: project.status,
        managerId: project.managerId,
        teamId: project.teamId,
        securityLevel: project.securityLevel
      });
    }
  }, [project, reset]);
  
  /**
   * Gère la soumission du formulaire
   * @param data - Données du formulaire
   */
  const onSubmit = async (data: UpdateProjectDto) => {
    try {
      await updateProject(id, data);
      showNotification('Projet mis à jour avec succès', 'success');
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      showNotification('Erreur lors de la mise à jour du projet', 'error');
    }
  };
  
  // Afficher un indicateur de chargement pendant le chargement des données
  if (isLoadingProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Si le projet n'existe pas
  if (!project && !isLoadingProject) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Projet non trouvé</h2>
        <p className="mt-2 text-gray-500">Le projet que vous cherchez n'existe pas ou a été supprimé.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/projects')}>
          Retour à la liste
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <PageHeader
        title={`Modifier le projet: ${project?.name || ''}`}
        description="Modifiez les informations du projet"
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push('/dashboard/projects')}
          >
            Retour
          </Button>
        }
      />
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nom du projet */}
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Le nom du projet est requis' }}
              render={({ field }) => (
                <Input
                  label="Nom du projet"
                  placeholder="Nom du projet"
                  error={errors.name?.message}
                  {...field}
                />
              )}
            />
            
            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Description"
                  placeholder="Description détaillée du projet"
                  error={errors.description?.message}
                  {...field}
                  value={field.value || ''}
                />
              )}
            />
            
            {/* Date de début */}
            <Controller
              name="startDate"
              control={control}
              rules={{ required: 'La date de début est requise' }}
              render={({ field: { value, onChange, ...field } }) => (
                <DatePicker
                  label="Date de début"
                  selected={value instanceof Date ? value : null}
                  onChange={onChange}
                  error={errors.startDate?.message}
                  {...field}
                />
              )}
            />
            
            {/* Date de fin (optionnelle) */}
            <Controller
              name="endDate"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <DatePicker
                  label="Date de fin (optionnelle)"
                  selected={value instanceof Date ? value : null}
                  onChange={onChange}
                  error={errors.endDate?.message}
                  {...field}
                />
              )}
            />
            
            {/* Statut */}
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Le statut est requis' }}
              render={({ field }) => (
                <Select
                  label="Statut"
                  options={[
                    { value: ProjectStatus.PLANNING, label: 'Planification' },
                    { value: ProjectStatus.ACTIVE, label: 'Actif' },
                    { value: ProjectStatus.ON_HOLD, label: 'En pause' },
                    { value: ProjectStatus.COMPLETED, label: 'Terminé' },
                    { value: ProjectStatus.CANCELLED, label: 'Annulé' },
                  ]}
                  error={errors.status?.message}
                  {...field}
                />
              )}
            />
            
            {/* Responsable */}
            <Controller
              name="managerId"
              control={control}
              rules={{ required: 'Le responsable est requis' }}
              render={({ field }) => (
                <Select
                  label="Responsable du projet"
                  options={[
                    { value: '', label: 'Sélectionner un responsable', disabled: true },
                    ...users.map(user => ({
                      value: user.id,
                      label: `${user.firstName} ${user.lastName}`
                    }))
                  ]}
                  error={errors.managerId?.message}
                  searchable={true}
                  searchPlaceholder="Rechercher un responsable..."
                  {...field}
                />
              )}
            />
            
            {/* Équipe (optionnelle) */}
            <Controller
              name="teamId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Équipe associée (optionnelle)"
                  options={[
                    { value: '', label: 'Aucune équipe' },
                    ...teams.map(team => ({
                      value: team.id,
                      label: team.name
                    }))
                  ]}
                  error={errors.teamId?.message}
                  {...field}
                  value={field.value || ''}
                />
              )}
            />
            
            {/* Niveau de sécurité (optionnel) */}
            <Controller
              name="securityLevel"
              control={control}
              render={({ field }) => (
                <Select
                  label="Niveau de sécurité (optionnel)"
                  options={[
                    { value: '', label: 'Aucun' },
                    { value: 'Public', label: 'Public' },
                    { value: 'Restreint', label: 'Restreint' },
                    { value: 'Confidentiel', label: 'Confidentiel' },
                    { value: 'Secret', label: 'Secret' },
                  ]}
                  error={errors.securityLevel?.message}
                  {...field}
                  value={field.value || ''}
                />
              )}
            />
            
            {/* Bouton de soumission */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
                disabled={isUpdating}
              >
                Mettre à jour le projet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}