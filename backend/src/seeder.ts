/**
 * Script d'initialisation des données
 * Peuple la base de données avec des données initiales pour le développement et les tests.
 * @module Seeder
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ProjectsService } from './projects/projects.service';
import { DeadlinesService } from './deadlines/deadlines.service';
import { UserRole } from './users/entities/user.entity';
import { ProjectStatus } from './projects/entities/project.entity';
import { DeadlinePriority, DeadlineStatus, DeadlineVisibility } from './deadlines/entities/deadline.entity';

/**
 * Fonction principale d'initialisation des données
 * Crée des utilisateurs, projets et échéances de test
 */
async function bootstrap() {
  // Création d'un contexte d'application NestJS (sans serveur HTTP)
  const app = await NestFactory.createApplicationContext(AppModule);

  // Récupération des services nécessaires
  const usersService = app.get(UsersService);
  const projectsService = app.get(ProjectsService);
  const deadlinesService = app.get(DeadlinesService);

  try {
    // Création des utilisateurs de test
    console.log('Création des utilisateurs...');
    
    // Administrateur système
    const admin = await usersService.create({
      firstName: 'Admin',
      lastName: 'Système',
      email: 'admin@example.com',
      password: 'admin123', // Sera haché par le service
      role: UserRole.ADMIN,
      department: 'IT',
    });

    // Gestionnaire de projet
    const manager = await usersService.create({
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre.martin@example.com',
      password: 'manager123',
      role: UserRole.MANAGER,
      department: 'R&D',
    });

    // Utilisateur standard
    const user = await usersService.create({
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@example.com',
      password: 'user123',
      role: UserRole.USER,
      department: 'Production',
    });

    console.log('Utilisateurs créés avec succès');

    // Création des projets de test
    console.log('Création des projets...');
    
    // Projet Alpha (actif)
    const project1 = await projectsService.create({
      name: 'Projet Alpha',
      description: 'Développement du système de communication sécurisé',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
      managerId: manager.id,
      status: ProjectStatus.ACTIVE,
      securityLevel: 'Confidentiel',
    });

    // Projet Beta (en planification)
    const project2 = await projectsService.create({
      name: 'Projet Beta',
      description: 'Mise à jour de l\'infrastructure réseau',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-09-15'),
      managerId: manager.id,
      status: ProjectStatus.PLANNING,
      securityLevel: 'Restreint',
    });

    console.log('Projets créés avec succès');

    // Création des échéances de test
    console.log('Création des échéances...');
    
    // Échéance 1: Revue de conception
    await deadlinesService.create({
      title: 'Revue de conception',
      description: 'Présentation des plans de l\'architecture système',
      deadlineDate: new Date('2025-05-01T14:00:00'),
      creatorId: manager.id,
      priority: DeadlinePriority.HIGH,
      status: DeadlineStatus.NEW,
      visibility: DeadlineVisibility.TEAM,
      projectId: project1.id,
    });

    // Échéance 2: Livraison prototype
    await deadlinesService.create({
      title: 'Livraison prototype',
      description: 'Première version fonctionnelle du module de chiffrement',
      deadlineDate: new Date('2025-05-15T16:00:00'),
      creatorId: user.id,
      priority: DeadlinePriority.CRITICAL,
      status: DeadlineStatus.IN_PROGRESS,
      visibility: DeadlineVisibility.TEAM,
      projectId: project1.id,
    });

    // Échéance 3: Audit sécurité
    await deadlinesService.create({
      title: 'Audit sécurité',
      description: 'Évaluation des vulnérabilités par l\'équipe cybersécurité',
      deadlineDate: new Date('2025-05-30T10:00:00'),
      creatorId: admin.id,
      priority: DeadlinePriority.MEDIUM,
      status: DeadlineStatus.PENDING,
      visibility: DeadlineVisibility.DEPARTMENT,
      projectId: project1.id,
    });

    // Échéance 4: Inventaire équipement
    await deadlinesService.create({
      title: 'Inventaire équipement',
      description: 'Liste des équipements nécessaires au déploiement',
      deadlineDate: new Date('2025-04-05T09:00:00'),
      creatorId: manager.id,
      priority: DeadlinePriority.MEDIUM,
      status: DeadlineStatus.NEW,
      visibility: DeadlineVisibility.PRIVATE,
      projectId: project2.id,
    });

    console.log('Échéances créées avec succès');

    console.log('Données initiales ajoutées avec succès à la base de données');
    
  } catch (error) {
    // Gestion des erreurs pendant l'initialisation
    console.error('Erreur lors de l\'initialisation des données :', error);
  } finally {
    // Fermeture propre de l'application
    await app.close();
  }
}

// Exécution de la fonction d'initialisation
bootstrap();