/**
 * Page de détail d'une équipe
 * Affiche les informations détaillées d'une équipe et ses membres
 * @module app/dashboard/teams/[id]/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users,
  UserPlus,
  User,
  Building,
  Briefcase
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Modal,
  Select
} from '@/components/ui';
import { useTeam, useTeamMutations } from '@/hooks/useTeams';
import { useUsersList } from '@/hooks/useUsers';
import { useProjectsByTeam } from '@/hooks/useProjects';
import { useNotifications } from '@/app/providers';
import { AddTeamMembersModal } from '@/components/team';
import Link from 'next/link';

/**
 * Page détail d'une équipe
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.params - Paramètres de l'URL
 * @param {string} props.params.id - Identifiant de l'équipe
 * @returns Page de détail de l'équipe
 */
export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { showNotification } = useNotifications();
  
  // États locaux pour les modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddMultipleMembersModalOpen, setIsAddMultipleMembersModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  // Récupération des données de l'équipe
  const { data: team, isLoading, refetch } = useTeam(id);
  
  // Récupération des utilisateurs pour ajouter des membres
  const { data: users = [] } = useUsersList();
  
  // Récupération des projets associés à l'équipe
  const { data: projects = [], isLoading: isLoadingProjects } = useProjectsByTeam(id);
  
  // Mutations pour les opérations sur l'équipe
  const { 
    deleteTeam, 
    isDeleting,
    addTeamMember,
    isAddingMember,
    removeTeamMember,
    isRemovingMember,
    addTeamMembers,
    isAddingMembers
  } = useTeamMutations();
  
  /**
   * Gère la suppression de l'équipe
   */
  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(id);
      showNotification('Équipe supprimée avec succès', 'success');
      router.push('/dashboard/teams');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipe:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };
  
  /**
   * Gère l'ajout d'un membre à l'équipe
   */
  const handleAddMember = async () => {
    if (!selectedUserId) return;
    
    try {
      await addTeamMember(id, selectedUserId);
      showNotification('Membre ajouté avec succès', 'success');
      setIsAddMemberModalOpen(false);
      setSelectedUserId('');
      refetch();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      showNotification('Erreur lors de l\'ajout du membre', 'error');
    }
  };
  
  /**
   * Gère l'ajout de plusieurs membres à l'équipe
   * @param memberIds - IDs des utilisateurs à ajouter
   */
  const handleAddMultipleMembers = async (memberIds: string[]) => {
    try {
      await addTeamMembers(id, memberIds);
      showNotification(`${memberIds.length} membre(s) ajouté(s) avec succès`, 'success');
      setIsAddMultipleMembersModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des membres:', error);
      showNotification('Erreur lors de l\'ajout des membres', 'error');
    }
  };
  
  /**
   * Gère la suppression d'un membre de l'équipe
   * @param userId - ID de l'utilisateur à supprimer
   */
  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember(id, userId);
      showNotification('Membre retiré avec succès', 'success');
      refetch();
    } catch (error) {
      console.error('Erreur lors du retrait du membre:', error);
      showNotification('Erreur lors du retrait du membre', 'error');
    }
  };
  
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Si l'équipe n'existe pas
  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Équipe non trouvée</h2>
        <p className="mt-2 text-gray-500">L'équipe que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/teams')}>
          Retour à la liste
        </Button>
      </div>
    );
  }
  
  // Filtrer les utilisateurs qui ne sont pas déjà membres
  const availableUsers = users.filter(user => 
    !team.members?.some(member => member.id === user.id)
  );
  
  return (
    <>
      <PageHeader
        title={team.name}
        description="Détails de l'équipe"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/dashboard/teams')}
            >
              Retour
            </Button>
            <Button
              variant="primary"
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => router.push(`/dashboard/teams/${id}/edit`)}
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Supprimer
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Nom */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nom de l'équipe</h3>
                <p className="mt-1 text-lg">{team.name}</p>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{team.description || 'Aucune description'}</p>
              </div>
              
              {/* Département */}
              {team.department && (
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Département</h3>
                    <p className="mt-1">{team.department}</p>
                  </div>
                </div>
              )}
              
              {/* Chef d'équipe */}
              {team.leader && (
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Chef d'équipe</h3>
                    <p className="mt-1">
                      {team.leader.firstName} {team.leader.lastName}
                      <span className="text-sm text-gray-500 ml-2">({team.leader.email})</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Statistiques de l'équipe */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Nombre de membres */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Membres</h3>
                <p className="mt-1 text-xl font-semibold">{team.members?.length || 0}</p>
              </div>
              
              {/* Nombre de projets */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Projets associés</h3>
                <p className="mt-1 text-xl font-semibold">{projects.length}</p>
              </div>
              
              {/* Date de création */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Détails</h3>
                <p className="mt-1">ID: {team.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Liste des membres */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Membres de l'équipe</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus className="h-4 w-4" />}
                onClick={() => setIsAddMemberModalOpen(true)}
                disabled={availableUsers.length === 0}
              >
                Ajouter un membre
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Users className="h-4 w-4" />}
                onClick={() => setIsAddMultipleMembersModalOpen(true)}
                disabled={availableUsers.length === 0}
              >
                Ajouter plusieurs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!team.members || team.members.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <p>Aucun membre dans cette équipe</p>
                {availableUsers.length > 0 && (
                  <div className="mt-4 flex space-x-2 justify-center">
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAddMemberModalOpen(true)}
                    >
                      Ajouter un membre
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddMultipleMembersModalOpen(true)}
                    >
                      Ajouter plusieurs membres
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {team.members.map((member) => (
                  <div 
                    key={member.id}
                    className="flex justify-between items-center p-3 border border-slate-200 rounded hover:bg-slate-50"
                  >
                    <div>
                      <h3 className="font-medium">{member.firstName} {member.lastName}</h3>
                      <p className="text-sm text-slate-500">{member.email}</p>
                      {member.id === team.leaderId && (
                        <Badge variant="primary" className="mt-1">Chef d'équipe</Badge>
                      )}
                    </div>
                    
                    {member.id !== team.leaderId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        isLoading={isRemovingMember}
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Projets associés */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Projets associés</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <p>Aucun projet associé à cette équipe</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="block"
                  >
                    <div className="p-3 border border-slate-200 rounded hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{project.name}</h3>
                        <Badge variant={
                          project.status === 'actif' ? 'primary' : 
                          project.status === 'terminé' ? 'success' : 
                          project.status === 'planification' ? 'secondary' : 
                          project.status === 'en pause' ? 'warning' : 
                          project.status === 'annulé' ? 'danger' : 'default'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                      
                      {project.description && (
                        <p className="mt-2 text-sm text-slate-700 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center mt-2 text-sm text-slate-500">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>
                          {project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : 'Aucun responsable'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="sm"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDeleteTeam}
              isLoading={isDeleting}
            >
              Supprimer
            </Button>
          </div>
        }
      >
        <p>
          Êtes-vous sûr de vouloir supprimer l'équipe "{team.name}" ?
          Cette action ne supprimera pas les membres ou projets associés, mais rompra leur relation avec l'équipe.
        </p>
      </Modal>
      
      {/* Modal pour ajouter un membre */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Ajouter un membre à l'équipe"
        size="sm"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              Annuler
            </Button>
            
            <Button
              variant="primary"
              onClick={handleAddMember}
              isLoading={isAddingMember}
              disabled={!selectedUserId || isAddingMember}
            >
              Ajouter
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p>Sélectionnez un utilisateur à ajouter à l'équipe.</p>
          
          <Select
            label="Utilisateur"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            searchable={true}
            options={[
              { value: '', label: 'Sélectionner un utilisateur', disabled: true },
              ...availableUsers.map(user => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName} (${user.email})`
              }))
            ]}
          />
        </div>
      </Modal>
      
      {/* Modal pour ajouter plusieurs membres */}
      <AddTeamMembersModal
        isOpen={isAddMultipleMembersModalOpen}
        onClose={() => setIsAddMultipleMembersModalOpen(false)}
        teamId={id}
        existingMemberIds={team.members?.map(member => member.id) || []}
        leaderId={team.leaderId}
        onMembersAdded={handleAddMultipleMembers}
        isLoading={isAddingMembers}
      />
    </>
  );
}