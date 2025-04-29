/**
 * Composant DeadlineForm
 * Formulaire pour la création et la modification d'échéances
 * @module components/deadline/DeadlineForm
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, DatePicker, Select, Textarea, Button } from '@/components/ui';
import { 
  DeadlinePriority, 
  DeadlineStatus, 
  DeadlineVisibility, 
  Deadline,
  UpdateDeadlineDto,
  CreateDeadlineDto
} from '@/types';
import { useDeadlineMutations } from '@/hooks/useDeadlines';
import { useProjectsList } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';

/**
 * Options pour le select de priorité
 */
const priorityOptions = [
  { value: DeadlinePriority.LOW, label: 'Basse' },
  { value: DeadlinePriority.MEDIUM, label: 'Moyenne' },
  { value: DeadlinePriority.HIGH, label: 'Haute' },
  { value: DeadlinePriority.CRITICAL, label: 'Critique' },
];

/**
 * Options pour le select de statut
 */
const statusOptions = [
  { value: DeadlineStatus.NEW, label: 'Nouvelle' },
  { value: DeadlineStatus.IN_PROGRESS, label: 'En cours' },
  { value: DeadlineStatus.PENDING, label: 'En attente' },
  { value: DeadlineStatus.COMPLETED, label: 'Complétée' },
  { value: DeadlineStatus.CANCELLED, label: 'Annulée' },
];

/**
 * Options pour le select de visibilité
 */
const visibilityOptions = [
  { 
    value: DeadlinePriority.LOW, 
    label: 'Basse' 
  },
  { 
    value: DeadlineVisibility.PRIVATE, 
    label: 'Privée - Visible uniquement par vous' 
  },
  { 
    value: DeadlineVisibility.TEAM, 
    label: 'Équipe - Visible par les membres de l\'équipe' 
  },
  { 
    value: DeadlineVisibility.DEPARTMENT, 
    label: 'Département - Visible par tout le département' 
  },
  { 
    value: DeadlineVisibility.ORGANIZATION, 
    label: 'Organisation - Visible par toute l\'organisation' 
  },
];

/**
 * Props pour le composant DeadlineForm
 */
interface DeadlineFormProps {
  /** Échéance à modifier (si mode édition) */
  deadline?: Deadline;
  
  /** Callback appelé après soumission réussie */
  onSuccess?: () => void;
  
  /** Mode du formulaire (création ou édition) */
  mode?: 'create' | 'edit';
  
  /** ID du projet initial (optionnel, pour la création depuis un projet) */
  initialProjectId?: string;
}


/**
 * Composant DeadlineForm - Formulaire pour créer ou modifier une échéance
 * @param props - Propriétés du composant
 * @returns Composant DeadlineForm
 */
export const DeadlineForm = ({ 
  deadline, 
  onSuccess, 
  mode = 'create',
  initialProjectId
}: DeadlineFormProps) => {
  const { user } = useAuth();
  const { createDeadline, updateDeadline, isCreating, isUpdating } = useDeadlineMutations();
  const { data: projects = [] } = useProjectsList();
  
  // Initialize form with react-hook-form
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      title: deadline?.title || '',
      description: deadline?.description || '',
      deadlineDate: deadline?.deadlineDate ? new Date(deadline.deadlineDate) : new Date(),
      priority: deadline?.priority || DeadlinePriority.MEDIUM,
      status: deadline?.status || DeadlineStatus.NEW,
      visibility: deadline?.visibility || DeadlineVisibility.PRIVATE,
      projectId: deadline?.projectId || initialProjectId || '',
    },
  });

  // Reset form when deadline changes
  useEffect(() => {
    if (deadline) {
      reset({
        title: deadline.title,
        description: deadline.description || '',
        deadlineDate: new Date(deadline.deadlineDate),
        priority: deadline.priority,
        status: deadline.status,
        visibility: deadline.visibility,
        projectId: deadline.projectId || initialProjectId || '',
      });
    } else if (initialProjectId) {
      // Si on initialise avec un projectId (création depuis un projet)
      reset(prev => ({
        ...prev,
        projectId: initialProjectId
      }));
    }
  }, [deadline, initialProjectId, reset]);

  // Format project options
  const projectOptions = [
    { value: '', label: 'Aucun projet' },
    ...projects.map(project => ({
      value: project.id,
      label: project.name,
    })),
  ];

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        // Create new deadline
        await createDeadline({
          ...data,
          creatorId: user?.id || '',
        } as CreateDeadlineDto);
      } else {
        // Update existing deadline
        await updateDeadline(deadline!.id, data as UpdateDeadlineDto);
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form in create mode
      if (mode === 'create') {
        reset();
      }
    } catch (error) {
      console.error('Error submitting deadline:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title field */}
      <Controller
        name="title"
        control={control}
        rules={{ required: 'Le titre est obligatoire' }}
        render={({ field }) => (
          <Input
            {...field}
            label="Titre"
            placeholder="Titre de l'échéance"
            error={errors.title?.message}
          />
        )}
      />
      
      {/* Description field */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label="Description"
            placeholder="Description détaillée de l'échéance"
            error={errors.description?.message}
          />
        )}
      />
      
      {/* Deadline date field */}
      <Controller
        name="deadlineDate"
        control={control}
        rules={{ required: 'La date est obligatoire' }}
        render={({ field: { value, onChange, ...field } }) => (
          <DatePicker
            selected={value}
            onChange={onChange}
            showTimeSelect
            label="Date et heure d'échéance"
            error={errors.deadlineDate?.message}
            {...field}
          />
        )}
      />
      
      {/* Priority field */}
      <Controller
        name="priority"
        control={control}
        rules={{ required: 'La priorité est obligatoire' }}
        render={({ field }) => (
          <Select
            {...field}
            label="Priorité"
            options={priorityOptions}
            error={errors.priority?.message}
          />
        )}
      />
      
      {/* Status field */}
      <Controller
        name="status"
        control={control}
        rules={{ required: 'Le statut est obligatoire' }}
        render={({ field }) => (
          <Select
            {...field}
            label="Statut"
            options={statusOptions}
            error={errors.status?.message}
          />
        )}
      />
      
      {/* Visibility field */}
      <Controller
        name="visibility"
        control={control}
        rules={{ required: 'La visibilité est obligatoire' }}
        render={({ field }) => (
          <div className="space-y-2">
            <Select
              {...field}
              label="Visibilité"
              options={visibilityOptions}
              error={errors.visibility?.message}
            />
            <p className="text-sm text-slate-500 italic">
              Le niveau de visibilité détermine qui peut voir et accéder à cette échéance.
              Choisissez le niveau approprié en fonction de la sensibilité des informations.
            </p>
          </div>
        )}
      />
      
      {/* Project field */}
      <Controller
        name="projectId"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Projet associé (optionnel)"
            options={projectOptions}
            error={errors.projectId?.message}
          />
        )}
      />
      
      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isCreating || isUpdating}
        >
          {mode === 'create' ? 'Créer l\'échéance' : 'Mettre à jour l\'échéance'}
        </Button>
      </div>
    </form>
  );
};

export default DeadlineForm;