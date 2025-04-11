/**
 * Page de création d'une équipe
 * Formulaire pour ajouter une nouvelle équipe
 * @module app/dashboard/teams/create/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Input, Select, Button, Textarea, Badge } from '@/components/ui';
import { useTeamMutations } from '@/hooks/useTeams';
import { useUsersList } from '@/hooks/useUsers';
import { useNotifications } from '@/app/providers';
import { CreateTeamDto } from '@/types';

/**
 * Page de création d'une équipe
 * @returns Page avec formulaire de création d'équipe
 */
export default function CreateTeamPage() {
  const router = useRouter();
  const { showNotification } = useNotifications();
  const { createTeam, isCreating } = useTeamMutations();
  
  // Récupération des utilisateurs pour sélectionner un leader et membres
  const { data: users = [] } = useUsersList();
  
  // État local pour suivre les membres sélectionnés
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Initialisation du formulaire avec React Hook Form
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm<CreateTeamDto>({
    defaultValues: {
      name: '',
      description: '',
      leaderId: '',
      memberIds: [],
    }
  });
  
  // Observer l'ID du leader pour le mettre à jour
  const leaderId = watch('leaderId');
  
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
  const onSubmit = async (data: CreateTeamDto) => {
    try {
      // Ajouter les membres sélectionnés
      const teamData = {
        ...data,
        memberIds: selectedMembers,
      };
      
      await createTeam(teamData);
      showNotification('Équipe créée avec succès', 'success');
      router.push('/dashboard/teams');
    } catch (error) {
      console.error('Erreur lors de la création de l\'équipe:', error);
      showNotification('Erreur lors de la création de l\'équipe', 'error');
    }
  };
  
  return (
    <>
      <PageHeader
        title="Créer une équipe"
        description="Remplissez le formulaire pour créer une nouvelle équipe"
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push('/dashboard/teams')}
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
                  {...field}
                />
              )}
            />
            
            {/* Sélection des membres */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Membres de l'équipe
              </label>
              
              <div className="flex flex-col md:flex-row md:items-end gap-2 mb-3">
                <div className="flex-grow">
                  <Select
                    options={[
                      { value: '', label: 'Sélectionner un membre', disabled: true },
                      ...users
                        .filter(user => !selectedMembers.includes(user.id) && user.id !== leaderId)
                        .map(user => ({
                          value: user.id,
                          label: `${user.firstName} ${user.lastName}`
                        }))
                    ]}
                    onChange={(e) => e.target.value && handleAddMember(e.target.value)}
                    value=""
                  />
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    const select = document.querySelector('select') as HTMLSelectElement;
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
                  return (
                    <Badge 
                      key={memberId} 
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span>
                        {user?.firstName} {user?.lastName}
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
                isLoading={isCreating}
                disabled={isCreating}
              >
                Créer l'équipe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}