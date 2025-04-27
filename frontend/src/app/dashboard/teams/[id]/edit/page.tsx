/**
 * Page d'édition d'une équipe
 * Formulaire pour modifier une équipe existante
 * @module app/dashboard/teams/[id]/edit/page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Input, Badge, Button, Textarea } from '@/components/ui';
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
      
      // Initialiser les membres sélectionnés
      if (team.members) {
        const memberIds = team.members.map(member => member.id);
        setSelectedMembers(memberIds);
      } else {
        setSelectedMembers([]);
      }
    }
  }, [team, reset]);
  
  /**
   * Gère l'ajout d'un membre à l'équipe
   * @param memberId - ID de l'utilisateur à ajouter
   */
  const handleAddMember = (memberId: string) => {
    if (!selectedMembers.includes(memberId)) {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };
  
  /**
   * Gère la suppression d'un membre de l'équipe
   * @param memberId - ID de l'utilisateur à supprimer
   */
  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(id => id !== memberId));
  };
  
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Chef d'équipe
            </label>
            <Controller
              name="leaderId"
              control={control}
              rules={{ required: 'Le chef d\'équipe est requis' }}
              render={({ field }) => (
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  {...field}
                >
                  <option value="" disabled>Sélectionner un chef d'équipe</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.leaderId && (
              <p className="text-sm text-red-500">{errors.leaderId.message}</p>
            )}
            
            {/* Sélection des membres */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Membres de l'équipe
              </label>
              
              <div className="flex flex-col md:flex-row md:items-end gap-2 mb-3">
                <div className="flex-grow">
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    onChange={(e) => e.target.value && handleAddMember(e.target.value)}
                    value=""
                  >
                    <option value="" disabled>Sélectionner un membre</option>
                    {users
                      .filter(user => !selectedMembers.includes(user.id) && user.id !== leaderId)
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    const select = document.querySelector('select:not([name="leaderId"])') as HTMLSelectElement;
                    if (select && select.value) {
                      handleAddMember(select.value);
                      select.value = '';
                    }
                  }}
                >
                  Ajouter
                </Button>
              </div>
              
              {/* Affichage des membres sélectionnés */}
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Afficher le chef d'équipe */}
                {leaderId && (
                  <Badge variant="primary" className="flex items-center">
                    {users.find(u => u.id === leaderId)?.firstName} {users.find(u => u.id === leaderId)?.lastName} (Chef d'équipe)
                  </Badge>
                )}
                
                {/* Afficher les membres */}
                {selectedMembers.map(memberId => {
                  const user = users.find(u => u.id === memberId);
                  return user && (
                    <Badge 
                      key={memberId} 
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveMember(memberId)}
                        className="ml-1 rounded-full p-1 hover:bg-slate-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                
                {!leaderId && selectedMembers.length === 0 && (
                  <p className="text-sm text-slate-500">Aucun membre sélectionné</p>
                )}
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