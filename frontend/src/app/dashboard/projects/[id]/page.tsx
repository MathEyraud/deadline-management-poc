/**
 * Page de détail d'un projet
 * Affiche les informations détaillées d'un projet et ses échéances associées
 * @module app/dashboard/projects/[id]/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Users,
  PlusCircle
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Modal 
} from '@/components/ui';
import { useProject, useProjectMutations } from '@/hooks/useProjects';
import { useDeadlinesByProject, useDeadlineMutations } from '@/hooks/useDeadlines';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useNotifications } from '@/app/providers';
import { ProjectStatus, DeadlineStatus, DeadlinePriority } from '@/types';
import Link from 'next/link';
import { DeadlineForm } from '@/components/deadline/DeadlineForm';

/**
 * Page détail d'un projet
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.params - Paramètres de l'URL
 * @param {string} props.params.id - Identifiant du projet
 * @returns Page de détail du projet
 */
export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { showNotification } = useNotifications();
  
  // États locaux pour les modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewDeadlineModalOpen, setIsNewDeadlineModalOpen] = useState(false);
  
  // Récupération des données du projet
  const { data: project, isLoading: isLoadingProject, refetch } = useProject(id);
  
  // Récupération des échéances associées au projet
  const { data: deadlines = [], isLoading: isLoadingDeadlines, refetch: refetchDeadlines } = 
    useDeadlinesByProject(id);
  
  // Mutations pour les opérations sur le projet
  const { deleteProject, isDeleting } = useProjectMutations();
  
  /**
   * Obtient la variante de badge en fonction du statut du projet
   * @param status - Statut du projet
   * @returns Variante de badge correspondante
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
   * Obtient la variante de badge en fonction de la priorité de l'échéance
   * @param priority - Priorité de l'échéance
   * @returns Variante de badge correspondante
   */
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case DeadlinePriority.CRITICAL:
        return 'danger';
      case DeadlinePriority.HIGH:
        return 'warning';
      case DeadlinePriority.MEDIUM:
        return 'primary';
      case DeadlinePriority.LOW:
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  /**
   * Gère la suppression du projet
   */
  const handleDeleteProject = async () => {
    try {
      await deleteProject(id);
      showNotification('Projet supprimé avec succès', 'success');
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };
  
  // Affichage pendant le chargement
  if (isLoadingProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Si le projet n'existe pas
  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Projet non trouvé</h2>
        <p className="mt-2 text-gray-500">Le projet que vous recherchez n'existe pas ou a été supprimé.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/projects')}>
          Retour à la liste
        </Button>
      </div>
    );
  }
  
  // Déterminer si le projet est en retard
  const isProjectLate = project.endDate && new Date(project.endDate) < new Date() && 
    project.status !== ProjectStatus.COMPLETED && project.status !== ProjectStatus.CANCELLED;
  
  return (
    <>
      <PageHeader
        title={project.name}
        description="Détails du projet"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/dashboard/projects')}
            >
              Retour
            </Button>
            <Button
              variant="primary"
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => router.push(`/dashboard/projects/${id}/edit`)}
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
                <h3 className="text-sm font-medium text-gray-500">Nom du projet</h3>
                <p className="mt-1 text-lg">{project.name}</p>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{project.description || 'Aucune description'}</p>
              </div>
              
              {/* Dates */}
              <div className="flex flex-col md:flex-row md:space-x-6">
                <div className="flex items-center mb-4 md:mb-0">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de début</h3>
                    <p className="mt-1">{formatDate(project.startDate)}</p>
                  </div>
                </div>
                
                {project.endDate && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date de fin</h3>
                      <p className={`mt-1 ${isProjectLate ? 'text-red-500 font-medium' : ''}`}>
                        {formatDate(project.endDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Statut et sécurité */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                  <Badge className="mt-1" variant={getStatusBadgeVariant(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                
                {project.securityLevel && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Niveau de sécurité</h3>
                    <Badge className="mt-1" variant="outline">
                      {project.securityLevel}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Responsable */}
              {project.manager && (
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Responsable</h3>
                    <p className="mt-1">
                      {project.manager.firstName} {project.manager.lastName}
                      <span className="text-sm text-gray-500 ml-2">({project.manager.email})</span>
                    </p>
                  </div>
                </div>
              )}
              
              {/* Équipe */}
              {project.team && (
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Équipe</h3>
                    <p className="mt-1">{project.team.name}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Statistiques du projet */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Date de création */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Créé le</h3>
                <p className="mt-1">{formatDateTime(project.createdAt)}</p>
              </div>
              
              {/* Nombre d'échéances */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Échéances</h3>
                <div className="flex items-center justify-between mt-1">
                  <span>Total</span>
                  <Badge variant="default">{deadlines.length}</Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>En cours</span>
                  <Badge variant="primary">
                    {deadlines.filter(d => d.status === DeadlineStatus.IN_PROGRESS).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Terminées</span>
                  <Badge variant="success">
                    {deadlines.filter(d => d.status === DeadlineStatus.COMPLETED).length}
                  </Badge>
                </div>
              </div>
              
              {/* Avancement (basé sur les échéances terminées) */}
              {deadlines.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Avancement</h3>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ 
                          width: `${Math.round((deadlines.filter(d => d.status === DeadlineStatus.COMPLETED).length / deadlines.length) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 text-right">
                      {Math.round((deadlines.filter(d => d.status === DeadlineStatus.COMPLETED).length / deadlines.length) * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Liste des échéances du projet */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Échéances du projet</CardTitle>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              onClick={() => setIsNewDeadlineModalOpen(true)}
            >
              Ajouter une échéance
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingDeadlines ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : deadlines.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <p>Aucune échéance associée à ce projet</p>
                <Button 
                  variant="link"
                  onClick={() => setIsNewDeadlineModalOpen(true)}
                >
                  Ajouter une échéance
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {deadlines.map((deadline) => (
                  <Link
                    key={deadline.id}
                    href={`/dashboard/deadlines/${deadline.id}`}
                    className="block"
                  >
                    <div className="p-3 border border-slate-200 rounded hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900">{deadline.title}</h3>
                        <Badge variant={getPriorityBadgeVariant(deadline.priority)}>
                          {deadline.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center mt-2 text-sm text-slate-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span className={new Date(deadline.deadlineDate) < new Date() ? "text-red-500 font-medium" : ""}>
                          {formatDate(deadline.deadlineDate)}
                        </span>
                      </div>
                      
                      {deadline.description && (
                        <p className="mt-2 text-sm text-slate-700 line-clamp-2">
                          {deadline.description}
                        </p>
                      )}
                      
                      <div className="mt-2">
                        <Badge variant={deadline.status === DeadlineStatus.COMPLETED ? "success" :
                                deadline.status === DeadlineStatus.IN_PROGRESS ? "primary" :
                                deadline.status === DeadlineStatus.PENDING ? "warning" :
                                deadline.status === DeadlineStatus.CANCELLED ? "danger" : "secondary"}>
                          {deadline.status}
                        </Badge>
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
              onClick={handleDeleteProject}
              isLoading={isDeleting}
            >
              Supprimer
            </Button>
          </div>
        }
      >
        <p>
          Êtes-vous sûr de vouloir supprimer le projet "{project.name}" ?
          Cette action supprimera également toutes les échéances associées et est irréversible.
        </p>
      </Modal>
      
      {/* Modal pour ajouter une échéance */}
      <Modal
        isOpen={isNewDeadlineModalOpen}
        onClose={() => setIsNewDeadlineModalOpen(false)}
        title="Ajouter une échéance au projet"
        size="lg"
      >
        <DeadlineForm
          mode="create"
          onSuccess={() => {
            setIsNewDeadlineModalOpen(false);
            refetchDeadlines();
            showNotification('Échéance ajoutée avec succès', 'success');
          }}
          initialProjectId={id}
        />
      </Modal>
    </>
  );
}