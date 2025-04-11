/**
 * Page des paramètres utilisateur
 * Permet de configurer les préférences, le profil et les notifications
 * @module app/dashboard/settings/page
 */
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input, 
  Button, 
  Textarea,
  Select,
  Badge
} from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useUserMutations } from '@/hooks/useUsers';
import { useNotifications } from '@/app/providers';
import { UserRole } from '@/types';
import { User, Bell, Lock, LogOut } from 'lucide-react';

/**
 * Interface pour les préférences de notification
 */
interface NotificationPreferences {
  email: boolean;
  deadlineReminders: boolean;
  commentNotifications: boolean;
  teamUpdates: boolean;
  deadlinesBefore: number; // jours avant l'échéance
}

/**
 * Page des paramètres utilisateur
 * @returns Page de paramètres
 */
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { updateUser, isUpdating } = useUserMutations();
  const { showNotification } = useNotifications();
  
  // État pour suivre l'onglet actif
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  
// État pour les préférences de notification
const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email: true,
    deadlineReminders: true,
    commentNotifications: true,
    teamUpdates: false,
    deadlinesBefore: 3,
  });
  
  // Formulaire pour le profil utilisateur
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      department: user?.department || '',
    }
  });
  
  /**
   * Gère la mise à jour du profil utilisateur
   * @param data - Données du formulaire
   */
  const handleProfileUpdate = async (data: any) => {
    if (!user) return;
    
    try {
      await updateUser(user.id, data);
      showNotification('Profil mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showNotification('Erreur lors de la mise à jour du profil', 'error');
    }
  };
  
  /**
   * Gère la mise à jour des préférences de notification
   */
  const handleNotificationUpdate = async () => {
    if (!user) return;
    
    try {
      await updateUser(user.id, {
        notificationPreferences: notificationPrefs,
      });
      showNotification('Préférences de notification mises à jour', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };
  
  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = () => {
    logout();
    showNotification('Vous avez été déconnecté', 'info');
  };
  
  /**
   * Gère le changement d'un paramètre de notification
   * @param key - Clé de la préférence à modifier
   * @param value - Nouvelle valeur
   */
  const handleNotificationChange = (key: keyof NotificationPreferences, value: any) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Si aucun utilisateur n'est connecté
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Non connecté</h2>
        <p className="mt-2 text-gray-500">Vous devez être connecté pour accéder à vos paramètres.</p>
      </div>
    );
  }
  
  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Gérez votre profil et vos préférences"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Menu latéral */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center p-3 rounded-md mb-1 ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <User className="h-5 w-5 mr-2" />
                  <span>Profil</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center p-3 rounded-md mb-1 ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Bell className="h-5 w-5 mr-2" />
                  <span>Notifications</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center p-3 rounded-md mb-1 ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <Lock className="h-5 w-5 mr-2" />
                  <span>Sécurité</span>
                </button>
              </nav>
            </CardContent>
          </Card>
          
          {/* Informations du compte */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-2xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
                <Badge className="mt-2" variant="outline">{user.role}</Badge>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                leftIcon={<LogOut className="h-4 w-4" />}
                onClick={handleLogout}
              >
                Déconnexion
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Contenu principal */}
        <div className="md:col-span-3">
          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prénom */}
                    <Controller
                      name="firstName"
                      control={control}
                      rules={{ required: 'Le prénom est requis' }}
                      render={({ field }) => (
                        <Input
                          label="Prénom"
                          error={errors.firstName?.message}
                          {...field}
                        />
                      )}
                    />
                    
                    {/* Nom */}
                    <Controller
                      name="lastName"
                      control={control}
                      rules={{ required: 'Le nom est requis' }}
                      render={({ field }) => (
                        <Input
                          label="Nom"
                          error={errors.lastName?.message}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Email */}
                  <Controller
                    name="email"
                    control={control}
                    rules={{ 
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Adresse email invalide',
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        label="Email"
                        type="email"
                        error={errors.email?.message}
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
                        label="Département"
                        error={errors.department?.message}
                        {...field}
                      />
                    )}
                  />
                  
                  {/* Rôle (lecture seule) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Rôle
                    </label>
                    <Input
                      value={user.role}
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Le rôle ne peut être modifié que par un administrateur.
                    </p>
                  </div>
                  
                  {/* Bouton de sauvegarde */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isUpdating}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border-b">
                    <div>
                      <h3 className="font-medium">Notifications par email</h3>
                      <p className="text-sm text-slate-500">Recevoir des notifications par email</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle">
                      <input 
                        type="checkbox" 
                        id="toggle-email" 
                        className="sr-only"
                        checked={notificationPrefs.email}
                        onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      />
                      <label 
                        htmlFor="toggle-email" 
                        className={`block overflow-hidden h-6 rounded-full ${
                          notificationPrefs.email ? 'bg-blue-600' : 'bg-gray-300'
                        } cursor-pointer`}
                      >
                        <span 
                          className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                            notificationPrefs.email ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-b">
                    <div>
                      <h3 className="font-medium">Rappels d'échéances</h3>
                      <p className="text-sm text-slate-500">Notifications pour les échéances à venir</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle">
                      <input 
                        type="checkbox" 
                        id="toggle-deadline" 
                        className="sr-only"
                        checked={notificationPrefs.deadlineReminders}
                        onChange={(e) => handleNotificationChange('deadlineReminders', e.target.checked)}
                      />
                      <label 
                        htmlFor="toggle-deadline" 
                        className={`block overflow-hidden h-6 rounded-full ${
                          notificationPrefs.deadlineReminders ? 'bg-blue-600' : 'bg-gray-300'
                        } cursor-pointer`}
                      >
                        <span 
                          className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                            notificationPrefs.deadlineReminders ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-b">
                    <div>
                      <h3 className="font-medium">Notifications de commentaires</h3>
                      <p className="text-sm text-slate-500">Notifier des nouveaux commentaires sur vos échéances</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle">
                      <input 
                        type="checkbox" 
                        id="toggle-comments" 
                        className="sr-only"
                        checked={notificationPrefs.commentNotifications}
                        onChange={(e) => handleNotificationChange('commentNotifications', e.target.checked)}
                      />
                      <label 
                        htmlFor="toggle-comments" 
                        className={`block overflow-hidden h-6 rounded-full ${
                          notificationPrefs.commentNotifications ? 'bg-blue-600' : 'bg-gray-300'
                        } cursor-pointer`}
                      >
                        <span 
                          className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                            notificationPrefs.commentNotifications ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-b">
                    <div>
                      <h3 className="font-medium">Mises à jour d'équipe</h3>
                      <p className="text-sm text-slate-500">Notifications sur les changements dans vos équipes</p>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle">
                      <input 
                        type="checkbox" 
                        id="toggle-teams" 
                        className="sr-only"
                        checked={notificationPrefs.teamUpdates}
                        onChange={(e) => handleNotificationChange('teamUpdates', e.target.checked)}
                      />
                      <label 
                        htmlFor="toggle-teams" 
                        className={`block overflow-hidden h-6 rounded-full ${
                          notificationPrefs.teamUpdates ? 'bg-blue-600' : 'bg-gray-300'
                        } cursor-pointer`}
                      >
                        <span 
                          className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                            notificationPrefs.teamUpdates ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-b">
                    <div>
                      <h3 className="font-medium">Rappel avant échéance</h3>
                      <p className="text-sm text-slate-500">Nombre de jours avant l'échéance pour recevoir un rappel</p>
                    </div>
                    <Select
                      className="w-24"
                      value={notificationPrefs.deadlinesBefore.toString()}
                      onChange={(e) => handleNotificationChange('deadlinesBefore', parseInt(e.target.value))}
                      options={[
                        { value: '1', label: '1 jour' },
                        { value: '2', label: '2 jours' },
                        { value: '3', label: '3 jours' },
                        { value: '5', label: '5 jours' },
                        { value: '7', label: '1 semaine' },
                      ]}
                    />
                  </div>
                  
                  {/* Bouton de sauvegarde */}
                  <div className="flex justify-end mt-6">
                    <Button
                      variant="primary"
                      onClick={handleNotificationUpdate}
                      isLoading={isUpdating}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Changement de mot de passe */}
                  <div className="pb-6 border-b border-slate-200">
                    <h3 className="text-lg font-medium mb-4">Changement de mot de passe</h3>
                    <div className="space-y-4">
                      <Input 
                        label="Mot de passe actuel" 
                        type="password" 
                        placeholder="••••••••"
                      />
                      <Input 
                        label="Nouveau mot de passe" 
                        type="password" 
                        placeholder="••••••••"
                        helperText="8 caractères minimum, avec majuscules, minuscules et chiffres"
                      />
                      <Input 
                        label="Confirmer le nouveau mot de passe" 
                        type="password" 
                        placeholder="••••••••"
                      />
                      <div className="flex justify-end">
                        <Button variant="primary">
                          Changer le mot de passe
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sessions actives */}
                  <div className="pb-6 border-b border-slate-200">
                    <h3 className="text-lg font-medium mb-4">Sessions actives</h3>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">Cet appareil</p>
                          <p className="text-sm text-slate-500">Dernière activité: Aujourd'hui</p>
                        </div>
                        <Badge variant="success">Actif</Badge>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" className="text-red-600">
                          Déconnecter toutes les autres sessions
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Suppression du compte */}
                  <div>
                    <h3 className="text-lg font-medium text-red-600 mb-4">Danger</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      La suppression de votre compte est irréversible et supprimera toutes vos données.
                    </p>
                    <Button variant="outline" className="text-red-600 border-red-200">
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}