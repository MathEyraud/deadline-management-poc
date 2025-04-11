/**
 * Page de création d'un projet
 * Formulaire pour ajouter un nouveau projet
 * @module app/dashboard/projects/create/page
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Input, Select, Button, DatePicker, Textarea } from '@/components/ui';
import { useProjectMutations } from '@/hooks/useProjects';
import { useUsersList } from '@/hooks/useUsers';
import { useTeamsList } from '@/hooks/useTeams';
import { useNotifications } from '@/app/providers';
import { ProjectStatus, CreateProjectDto } from '@/types';

/**
 * Page de création d'un projet
 * @returns Page avec formulaire de création de projet
 */
export default function CreateProjectPage() {
  const router = useRouter();
  const { showNotification } = useNotifications();
  const { createProject, isCreating } = useProjectMutations();
  
  // Récupération des utilisateurs pour sélectionner un responsable
  const { data: users = [] } = useUsersList();
  // Récupération des équipes pour associer au projet
  const { data: teams = [] } = useTeamsList();
  
  // Initialisation du formulaire avec React Hook Form
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<CreateProjectDto>({
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date(),
      status: ProjectStatus.PLANNING,
      managerId: '',
    }
  });
  
  /**
   * Gère la soumission du formulaire
   * @param data - Données du formulaire
   */
  const onSubmit = async (data: CreateProjectDto) => {
    try {
      await createProject(data);
      showNotification('Projet créé avec succès', 'success');
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      showNotification('Erreur lors de la création du projet', 'error');
    }
  };
  
  return (
    <>
      <PageHeader
        title="Créer un projet"
        description="Remplissez le formulaire pour créer un nouveau projet"
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
                />
              )}
            />
            
            {/* Bouton de soumission */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isCreating}
                disabled={isCreating}
              >
                Créer le projet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}