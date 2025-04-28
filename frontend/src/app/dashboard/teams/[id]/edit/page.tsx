/**
 * Page d'édition d'une équipe
 * Formulaire pour modifier une équipe existante
 * @module app/dashboard/teams/[id]/edit/page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Input, Button, Textarea, Select } from '@/components/ui';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { useTeam, useTeamMutations } from '@/hooks/useTeams';
import { useUsersList } from '@/hooks/useUsers';
import { useNotifications } from '@/app/providers';
import { UpdateTeamDto } from '@/types';

/**
 * Page d'édition d'une équipe
 * @param {Object} props - Propriétés de la page
 * @param {Object} props.params - Paramètres de route
 * @param {string} props.params.id - ID de l'équipe
 * @returns Page avec formulaire d'édition d'équipe
 */
export default function EditTeamPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { showNotification } = useNotifications();
  
  // Récupération des données de l'équipe
  const { data: team, isLoading: isLoadingTeam } = useTeam(id);
  
  // État local pour suivre les membres sélectionnés
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Récupération des mutations
  const { updateTeam, isUpdating } = useTeamMutations();
  
  // Récupération des utilisateurs pour sélectionner un leader et membres
  const { data: users = [] } = useUsersList();
  
  // Initialisation du formulaire avec React Hook Form
  const { 
    control, 
    handleSubmit, 
    reset,
    watch,
    formState: { errors } 
  } = useForm<UpdateTeamDto>();
  
  // Observer l'ID du leader pour le mettre à jour
  const leaderId = watch('leaderId');
  
  // Remplir le formulaire avec les données de l'équipe quand elles sont chargées
  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description || '',
        department: team.department || '',
        leaderId: team.leaderId,
      });
      
      // Initialiser les membres sélectionnés de manière sûre
      if (team.members) {
        const memberIds = team.members
          .filter(member => member !== null && member.id !== team.leaderId) // Exclure le leader des membres
          .map(member => member.id);
        setSelectedMembers(memberIds);
      } else {
        setSelectedMembers([]);
      }
    }
  }, [team, reset]);
  
  /**
   * Gère la soumission du formulaire
   * @param data - Données du formulaire
   */
  const onSubmit = async (data: UpdateTeamDto) => {
    try {
      // Ajouter les membres sélectionnés
      const teamData: UpdateTeamDto = {
        ...data,
        memberIds: selectedMembers,
      };
      
      await updateTeam(id, teamData);
      showNotification('Équipe mise à jour avec succès', 'success');
      router.push(`/dashboard/teams/${id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'équipe:', error);
      showNotification('Erreur lors de la mise à jour de l\'équipe', 'error');
    }
  };
  
  // Préparer les options pour le MultiSelect
  const memberOptions = users
    .filter(user => user.id !== leaderId)
    .map(user => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName}`,
      description: user.email
    }));
  
  // Récupérer les informations du leader pour l'affichage
  const leaderDetails = leaderId 
    ? users.find(u => u.id === leaderId)
    : null;
  
  // Afficher un indicateur de chargement pendant le chargement des données
  if (isLoadingTeam) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Si l'équipe n'existe pas
  if (!team && !isLoadingTeam) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Équipe non trouvée</h2>
        <p className="mt-2 text-gray-500">L'équipe que vous cherchez n'existe pas ou a été supprimée.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/teams')}>
          Retour à la liste
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <PageHeader
        title={`Modifier l'équipe: ${team?.name || ''}`}
        description="Modifiez les informations de l'équipe"
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push(`/dashboard/teams/${id}`)}
          >
            Retour
          </Button>
        }
      />
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nom de l'équipe */}
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Le nom de l\'équipe est requis' }}
              render={({ field }) => (
                <Input
                  label="Nom de l'équipe"
                  placeholder="Nom de l'équipe"
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
                  placeholder="Description détaillée de l'équipe"
                  error={errors.description?.message}
                  {...field}
                />
              )}
            />
            
            {/* Département */}
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Input
                  label="Département (optionnel)"
                  placeholder="Ex: R&D, Marketing, etc."
                  error={errors.department?.message}
                  {...field}
                />
              )}
            />
            
            {/* Chef d'équipe */}
            <Controller
              name="leaderId"
              control={control}
              rules={{ required: 'Le chef d\'équipe est requis' }}
              render={({ field }) => (
                <Select
                  label="Chef d'équipe"
                  options={[
                    { value: '', label: 'Sélectionner un chef d\'équipe', disabled: true },
                    ...users.map(user => ({
                      value: user.id,
                      label: `${user.firstName} ${user.lastName}`
                    }))
                  ]}
                  error={errors.leaderId?.message}
                  searchable={true}
                  searchPlaceholder="Rechercher un chef d'équipe..."
                  {...field}
                />
              )}
            />
            
            {/* Sélection des membres */}
            <div>
              <MultiSelect
                label="Membres de l'équipe"
                options={memberOptions}
                selectedValues={selectedMembers}
                onChange={setSelectedMembers}
                placeholder="Sélectionner des membres"
                noOptionsMessage="Aucun utilisateur disponible"
                tagsPosition="inline"
              />
              
              {/* Affichage unifié du chef d'équipe et des membres sélectionnés */}
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Composition de l'équipe:</p>
                <div className="flex flex-wrap gap-2">
                  {/* Chef d'équipe en rouge */}
                  {leaderId && leaderDetails && (
                    <div 
                      className="bg-red-100 text-red-800 rounded-md pl-2 pr-1 py-1 text-sm flex items-center"
                    >
                      <div className="flex flex-col mr-1">
                        <span>{leaderDetails.firstName} {leaderDetails.lastName}</span>
                        <span className="text-xs text-red-600">Chef d'équipe</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Membres en bleu */}
                  {selectedMembers.map(memberId => {
                    const member = users.find(u => u.id === memberId);
                    if (!member) return null;
                    
                    return (
                      <div 
                        key={member.id}
                        className="bg-blue-100 text-blue-800 rounded-md pl-2 pr-1 py-1 text-sm flex items-center"
                      >
                        <div className="flex flex-col mr-1">
                          <span>{member.firstName} {member.lastName}</span>
                          <span className="text-xs text-blue-500">{member.email}</span>
                        </div>
                        <button
                          type="button"
                          className="text-blue-500 hover:text-blue-700 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => {
                            setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  
                  {!leaderId && selectedMembers.length === 0 && (
                    <p className="text-sm text-slate-500">Aucun membre sélectionné</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bouton de soumission */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
                disabled={isUpdating}
              >
                Mettre à jour l'équipe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}