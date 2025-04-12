/**
 * Script d'initialisation des données
 * Peuple la base de données avec des données complètes pour le développement et les tests.
 * @module Seeder
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ProjectsService } from './projects/projects.service';
import { DeadlinesService } from './deadlines/deadlines.service';
import { TeamsService } from './teams/teams.service';
import { CommentsService } from './comments/comments.service';
import { AttachmentsService } from './attachments/attachments.service';
import { UserRole } from './users/entities/user.entity';
import { ProjectStatus } from './projects/entities/project.entity';
import { DeadlinePriority, DeadlineStatus, DeadlineVisibility } from './deadlines/entities/deadline.entity';
import { CommentVisibility } from './comments/entities/comment.entity';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Structure des données d'un utilisateur pour l'initialisation
 */
interface UserSeedData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
}

/**
 * Structure des données d'un projet pour l'initialisation
 */
interface ProjectSeedData {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date | undefined; // Changer de null à undefined
  managerId: string;
  status: ProjectStatus;
  securityLevel: string;
  teamId?: string;
}

/**
 * Structure des données d'une équipe pour l'initialisation
 */
interface TeamSeedData {
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  department: string;
}

/**
 * Structure des données d'une échéance pour l'initialisation
 */
interface DeadlineSeedData {
  title: string;
  description: string;
  deadlineDate: Date;
  creatorId: string;
  priority: DeadlinePriority;
  status: DeadlineStatus;
  visibility: DeadlineVisibility;
  projectId: string;
}

/**
 * Structure des données d'un commentaire pour l'initialisation
 */
interface CommentSeedData {
  content: string;
  authorId: string;
  deadlineId: string;
  visibility: CommentVisibility;
}

/**
 * Structure des données d'une pièce jointe pour l'initialisation
 */
interface AttachmentSeedData {
  filename: string;
  mimeType: string;
  size: number;
  deadlineId: string;
  uploaderId: string;
  classification?: string;
}

/**
 * Crée un fichier factice pour simuler un upload
 * @param filename Nom du fichier à créer
 * @returns Chemin du fichier créé
 */
function createDummyFile(filename: string): string {
  // S'assurer que le dossier uploads existe
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Générer un contenu aléatoire (simuler un fichier)
  const content = `Contenu simulé pour le fichier ${filename} - ${new Date().toISOString()}`;
  
  // Créer un nom de fichier unique pour éviter les collisions
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  const uniqueFilename = `${basename}_${uniqueSuffix}${extension}`;
  
  // Chemin complet du fichier
  const filePath = path.join(uploadsDir, uniqueFilename);
  
  // Écrire le fichier
  fs.writeFileSync(filePath, content);
  
  return filePath;
}

/**
 * Fonction principale d'initialisation des données
 * Crée des utilisateurs, équipes, projets, échéances, commentaires et pièces jointes de test
 */
async function bootstrap() {
  // Création d'un contexte d'application NestJS (sans serveur HTTP)
  const app = await NestFactory.createApplicationContext(AppModule);

  // Récupération des services nécessaires
  const usersService = app.get(UsersService);
  const projectsService = app.get(ProjectsService);
  const deadlinesService = app.get(DeadlinesService);
  const teamsService = app.get(TeamsService);
  const commentsService = app.get(CommentsService);
  const attachmentsService = app.get(AttachmentsService);

  try {
    console.log('Début de l\'initialisation des données...');

    // ========== CRÉATION DES UTILISATEURS ==========
    console.log('Création des utilisateurs...');
    
    // Administrateurs
    const adminData: UserSeedData[] = [
      {
        firstName: 'Admin',
        lastName: 'Système',
        email: 'admin@naval-defense.fr',
        password: 'Admin@123',
        role: UserRole.ADMIN,
        department: 'IT'
      },
      {
        firstName: 'Directeur',
        lastName: 'Sécurité',
        email: 'dsecurite@naval-defense.fr',
        password: 'Security@456',
        role: UserRole.ADMIN,
        department: 'Sécurité'
      }
    ];
    
    // Gestionnaires
    const managerData: UserSeedData[] = [
      {
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'p.durand@naval-defense.fr',
        password: 'Manager@123',
        role: UserRole.MANAGER,
        department: 'Construction Navale'
      },
      {
        firstName: 'Sophie',
        lastName: 'Martin',
        email: 's.martin@naval-defense.fr',
        password: 'Manager@456',
        role: UserRole.MANAGER,
        department: 'Rénovation'
      },
      {
        firstName: 'Thomas',
        lastName: 'Leroy',
        email: 't.leroy@naval-defense.fr',
        password: 'Manager@789',
        role: UserRole.MANAGER,
        department: 'Démantèlement'
      },
      {
        firstName: 'Isabelle',
        lastName: 'Moreau',
        email: 'i.moreau@naval-defense.fr',
        password: 'Manager@101',
        role: UserRole.MANAGER,
        department: 'Ingénierie'
      }
    ];
    
    // Utilisateurs standard
    const userData: UserSeedData[] = [
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'j.dupont@naval-defense.fr',
        password: 'User@123',
        role: UserRole.USER,
        department: 'Construction Navale'
      },
      {
        firstName: 'Marie',
        lastName: 'Bernard',
        email: 'm.bernard@naval-defense.fr',
        password: 'User@456',
        role: UserRole.USER,
        department: 'Construction Navale'
      },
      {
        firstName: 'Paul',
        lastName: 'Petit',
        email: 'p.petit@naval-defense.fr',
        password: 'User@789',
        role: UserRole.USER,
        department: 'Rénovation'
      },
      {
        firstName: 'Claire',
        lastName: 'Robert',
        email: 'c.robert@naval-defense.fr',
        password: 'User@101',
        role: UserRole.USER,
        department: 'Rénovation'
      },
      {
        firstName: 'Antoine',
        lastName: 'Richard',
        email: 'a.richard@naval-defense.fr',
        password: 'User@102',
        role: UserRole.USER,
        department: 'Démantèlement'
      },
      {
        firstName: 'Émilie',
        lastName: 'Simon',
        email: 'e.simon@naval-defense.fr',
        password: 'User@103',
        role: UserRole.USER,
        department: 'Démantèlement'
      },
      {
        firstName: 'Lucas',
        lastName: 'Dubois',
        email: 'l.dubois@naval-defense.fr',
        password: 'User@104',
        role: UserRole.USER,
        department: 'Ingénierie'
      },
      {
        firstName: 'Camille',
        lastName: 'Laurent',
        email: 'c.laurent@naval-defense.fr',
        password: 'User@105',
        role: UserRole.USER,
        department: 'Ingénierie'
      }
    ];
    
    // Création des utilisateurs dans la base de données
    const admins = await Promise.all(
      adminData.map(admin => usersService.create(admin))
    );
    
    const managers = await Promise.all(
      managerData.map(manager => usersService.create(manager))
    );
    
    const users = await Promise.all(
      userData.map(user => usersService.create(user))
    );
    
    // Consolidation de tous les utilisateurs dans une seule liste
    const allUsers = [...admins, ...managers, ...users];
    console.log(`${allUsers.length} utilisateurs créés avec succès`);

    // ========== CRÉATION DES ÉQUIPES ==========
    console.log('Création des équipes...');
    
    // Données des équipes
    const teamData: TeamSeedData[] = [
      {
        name: 'Équipe Construction Frégate',
        description: 'Équipe responsable de la construction de la nouvelle frégate Mistral',
        leaderId: managers[0].id, // Pierre Durand
        memberIds: [users[0].id, users[1].id, users[6].id], // Jean, Marie, Lucas
        department: 'Construction Navale'
      },
      {
        name: 'Équipe Rénovation Destroyer',
        description: 'Équipe chargée de la rénovation du destroyer Tonnerre',
        leaderId: managers[1].id, // Sophie Martin
        memberIds: [users[2].id, users[3].id, users[7].id], // Paul, Claire, Camille
        department: 'Rénovation'
      },
      {
        name: 'Équipe Démantèlement',
        description: 'Équipe responsable du démantèlement du croiseur Éclair',
        leaderId: managers[2].id, // Thomas Leroy
        memberIds: [users[4].id, users[5].id], // Antoine, Émilie
        department: 'Démantèlement'
      },
      {
        name: 'Équipe Ingénierie & Design',
        description: 'Équipe d\'experts techniques pour tous les projets',
        leaderId: managers[3].id, // Isabelle Moreau
        memberIds: [users[6].id, users[7].id], // Lucas, Camille
        department: 'Ingénierie'
      }
    ];
    
    // Création des équipes dans la base de données
    const teams = await Promise.all(
      teamData.map(team => teamsService.create(team))
    );
    console.log(`${teams.length} équipes créées avec succès`);

    // ========== CRÉATION DES PROJETS ==========
    console.log('Création des projets...');
    
    // Données des projets
    const projectData: ProjectSeedData[] = [
      {
        name: 'Construction Frégate Mistral',
        description: 'Projet de construction de la nouvelle frégate de défense maritime Mistral, dotée des dernières technologies de combat naval.',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2028-06-30'),
        managerId: managers[0].id, // Pierre Durand
        status: ProjectStatus.ACTIVE,
        securityLevel: 'Confidentiel Défense',
        teamId: teams[0].id // Équipe Construction
      },
      {
        name: 'Rénovation Destroyer Tonnerre',
        description: 'Projet de rénovation et mise à niveau du destroyer Tonnerre pour prolonger sa durée de vie opérationnelle de 15 ans.',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2026-12-30'),
        managerId: managers[1].id, // Sophie Martin
        status: ProjectStatus.ACTIVE,
        securityLevel: 'Secret Défense',
        teamId: teams[1].id // Équipe Rénovation
      },
      {
        name: 'Démantèlement Croiseur Éclair',
        description: 'Projet de démantèlement du croiseur Éclair en fin de vie, avec récupération des matériaux sensibles et recyclage conformément aux normes environnementales.',
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-12-31'),
        managerId: managers[2].id, // Thomas Leroy
        status: ProjectStatus.PLANNING,
        securityLevel: 'Restreint',
        teamId: teams[2].id // Équipe Démantèlement
      }
    ];
    
    // Création des projets dans la base de données
    const projects = await Promise.all(
      projectData.map(project => projectsService.create(project))
    );
    console.log(`${projects.length} projets créés avec succès`);

    // ========== CRÉATION DES ÉCHÉANCES ==========
    console.log('Création des échéances...');
    
    // Construction Frégate Mistral
    const deadlinesConstruction: DeadlineSeedData[] = [
      {
        title: 'Validation des plans définitifs',
        description: 'Revue finale et validation des plans de construction de la frégate Mistral par la direction technique.',
        deadlineDate: new Date('2025-02-28T14:00:00'),
        creatorId: managers[0].id, // Pierre Durand
        priority: DeadlinePriority.CRITICAL,
        status: DeadlineStatus.COMPLETED,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[0].id
      },
      {
        title: 'Commande des matériaux principaux',
        description: 'Passation des commandes pour les matériaux principaux (acier, alliages spéciaux) auprès des fournisseurs agréés.',
        deadlineDate: new Date('2025-03-15T10:00:00'),
        creatorId: managers[0].id, // Pierre Durand
        priority: DeadlinePriority.HIGH,
        status: DeadlineStatus.COMPLETED,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[0].id
      },
      {
        title: 'Préparation du chantier naval',
        description: 'Aménagement du chantier naval pour le début de la construction et installation des équipements spécifiques.',
        deadlineDate: new Date('2025-04-10T09:00:00'),
        creatorId: users[0].id, // Jean Dupont
        priority: DeadlinePriority.MEDIUM,
        status: DeadlineStatus.IN_PROGRESS,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[0].id
      },
      {
        title: 'Début de la construction de la coque',
        description: 'Lancement des travaux de construction de la coque principale du navire.',
        deadlineDate: new Date('2025-05-15T08:00:00'),
        creatorId: managers[0].id, // Pierre Durand
        priority: DeadlinePriority.HIGH,
        status: DeadlineStatus.NEW,
        visibility: DeadlineVisibility.DEPARTMENT,
        projectId: projects[0].id
      },
      {
        title: 'Revue de sécurité initiale',
        description: 'Première revue des aspects sécurité et conformité avec les normes militaires.',
        deadlineDate: new Date('2025-06-01T14:00:00'),
        creatorId: admins[1].id, // Directeur Sécurité
        priority: DeadlinePriority.HIGH,
        status: DeadlineStatus.NEW,
        visibility: DeadlineVisibility.DEPARTMENT,
        projectId: projects[0].id
      }
    ];
    
    // Rénovation Destroyer Tonnerre
    const deadlinesRenovation: DeadlineSeedData[] = [
      {
        title: 'Entrée en cale sèche',
        description: 'Transfert du destroyer Tonnerre en cale sèche pour inspection initiale et évaluation détaillée.',
        deadlineDate: new Date('2025-03-15T08:00:00'),
        creatorId: managers[1].id, // Sophie Martin
        priority: DeadlinePriority.CRITICAL,
        status: DeadlineStatus.COMPLETED,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[1].id
      },
      {
        title: 'Démontage des systèmes obsolètes',
        description: 'Retrait de tous les systèmes électroniques et d\'armement obsolètes pour remplacement.',
        deadlineDate: new Date('2025-04-20T09:00:00'),
        creatorId: users[2].id, // Paul Petit
        priority: DeadlinePriority.HIGH,
        status: DeadlineStatus.IN_PROGRESS,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[1].id
      },
      {
        title: 'Inspection de l\'intégrité structurelle',
        description: 'Évaluation complète de l\'intégrité de la coque et des structures internes.',
        deadlineDate: new Date('2025-05-05T10:00:00'),
        creatorId: managers[1].id, // Sophie Martin
        priority: DeadlinePriority.HIGH,
        status: DeadlineStatus.NEW,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[1].id
      },
      {
        title: 'Installation des nouveaux systèmes de propulsion',
        description: 'Remplacement des moteurs et systèmes de propulsion par des modèles plus efficaces.',
        deadlineDate: new Date('2025-07-15T08:00:00'),
        creatorId: users[3].id, // Claire Robert
        priority: DeadlinePriority.MEDIUM,
        status: DeadlineStatus.NEW,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[1].id
      },
      {
        title: 'Mise à niveau du système de combat',
        description: 'Installation et calibration des nouveaux systèmes d\'armement et de défense.',
        deadlineDate: new Date('2025-09-30T10:00:00'),
        creatorId: managers[1].id, // Sophie Martin
        priority: DeadlinePriority.CRITICAL,
        status: DeadlineStatus.NEW,
        visibility: DeadlineVisibility.DEPARTMENT,
        projectId: projects[1].id
      }
    ];
    
    // Démantèlement Croiseur Éclair
    const deadlinesDemantelement: DeadlineSeedData[] = [
      {
        title: 'Finalisation du plan de démantèlement',
        description: 'Élaboration du plan détaillé pour le démantèlement sécurisé et respectueux de l\'environnement.',
        deadlineDate: new Date('2025-03-01T14:00:00'),
        creatorId: managers[2].id, // Thomas Leroy
        priority: DeadlinePriority.HIGH,
        status: DeadlineStatus.IN_PROGRESS,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[2].id
      },
      {
        title: 'Obtention des autorisations environnementales',
        description: 'Soumission des dossiers aux autorités pour obtenir les autorisations nécessaires.',
        deadlineDate: new Date('2025-04-15T16:00:00'),
        creatorId: users[4].id, // Antoine Richard
        priority: DeadlinePriority.CRITICAL,
        status: DeadlineStatus.PENDING,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[2].id
      },
      {
        title: 'Retrait des matériaux dangereux',
        description: 'Identification et retrait sécurisé de tous les matériaux classés dangereux.',
        deadlineDate: new Date('2025-06-01T09:00:00'),
        creatorId: managers[2].id, // Thomas Leroy
        priority: DeadlinePriority.CRITICAL,
        status: DeadlineStatus.NEW,
        visibility: DeadlineVisibility.DEPARTMENT,
        projectId: projects[2].id
      },
      {
        title: 'Désassemblage des systèmes d\'armement',
        description: 'Démontage et sécurisation de tous les systèmes d\'armement classifiés.',
        deadlineDate: new Date('2025-07-30T09:00:00'),
        creatorId: users[5].id, // Émilie Simon
        priority: DeadlinePriority.HIGH,
        status: DeadlineStatus.NEW,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[2].id
      },
      {
        title: 'Découpe de la coque principale',
        description: 'Découpage de la coque en sections pour recyclage des matériaux.',
        deadlineDate: new Date('2025-10-15T08:00:00'),
        creatorId: managers[2].id, // Thomas Leroy
        priority: DeadlinePriority.MEDIUM,
        status: DeadlineStatus.NEW,
        visibility: DeadlineVisibility.TEAM,
        projectId: projects[2].id
      }
    ];
    
    // Fusion de toutes les échéances
    const allDeadlines = [...deadlinesConstruction, ...deadlinesRenovation, ...deadlinesDemantelement];
    
    // Création des échéances dans la base de données
    const deadlines = await Promise.all(
      allDeadlines.map(deadline => deadlinesService.create(deadline))
    );
    console.log(`${deadlines.length} échéances créées avec succès`);

    // ========== CRÉATION DES COMMENTAIRES ==========
    console.log('Création des commentaires...');
    
    // Liste des commentaires pour différentes échéances
    const commentData: CommentSeedData[] = [
      // Commentaires sur la validation des plans de la frégate
      {
        content: 'Le bureau d\'études a terminé les modifications demandées lors de la dernière revue.',
        authorId: users[0].id, // Jean Dupont
        deadlineId: deadlines[0].id,
        visibility: CommentVisibility.PUBLIC
      },
      {
        content: 'Les plans sont conformes aux exigences militaires pour ce type de navire.',
        authorId: managers[0].id, // Pierre Durand
        deadlineId: deadlines[0].id,
        visibility: CommentVisibility.PUBLIC
      },
      {
        content: 'N\'oubliez pas d\'inclure les modifications pour la mise aux normes 2025 des systèmes de sécurité.',
        authorId: admins[1].id, // Directeur Sécurité
        deadlineId: deadlines[0].id,
        visibility: CommentVisibility.PUBLIC
      },
      
      // Commentaires sur la commande des matériaux
      {
        content: 'Le fournisseur principal a confirmé la disponibilité des alliages spéciaux pour la date prévue.',
        authorId: users[1].id, // Marie Bernard
        deadlineId: deadlines[1].id,
        visibility: CommentVisibility.PUBLIC
      },
      {
        content: 'Il faudra prévoir une inspection spécifique à la réception des matériaux critiques.',
        authorId: managers[0].id, // Pierre Durand
        deadlineId: deadlines[1].id,
        visibility: CommentVisibility.PRIVATE
      },
      
      // Commentaires sur l'entrée en cale sèche du destroyer
      {
        content: 'L\'état général de la coque est meilleur que prévu initialement.',
        authorId: users[2].id, // Paul Petit
        deadlineId: deadlines[5].id,
        visibility: CommentVisibility.PUBLIC
      },
      {
        content: 'Nous devrions prévoir des inspections supplémentaires sur les zones de jonction des modules.',
        authorId: managers[1].id, // Sophie Martin
        deadlineId: deadlines[5].id,
        visibility: CommentVisibility.PUBLIC
      },
      
      // Commentaires sur le démontage des systèmes obsolètes
      {
        content: 'Nous avons identifié plusieurs composants qui pourraient être réutilisés après reconditionnement.',
        authorId: users[3].id, // Claire Robert
        deadlineId: deadlines[6].id,
        visibility: CommentVisibility.PUBLIC
      },
      {
        content: 'Attention à bien respecter les procédures de démontage pour les systèmes classifiés.',
        authorId: admins[1].id, // Directeur Sécurité
        deadlineId: deadlines[6].id,
        visibility: CommentVisibility.PUBLIC
      },
      
      // Commentaires sur le plan de démantèlement
      {
        content: 'Il faudra prévoir une zone de confinement supplémentaire pour le traitement des matériaux composites.',
        authorId: users[4].id, // Antoine Richard
        deadlineId: deadlines[10].id,
        visibility: CommentVisibility.PUBLIC
      },
      {
        content: 'Le planning proposé est réaliste mais laisse peu de marge pour les imprévus.',
        authorId: managers[2].id, // Thomas Leroy
        deadlineId: deadlines[10].id,
        visibility: CommentVisibility.PUBLIC
      },
      
      // Commentaires sur l'obtention des autorisations environnementales
      {
        content: 'L\'agence environnementale a demandé des précisions sur la gestion des effluents lors du démantèlement.',
        authorId: users[5].id, // Émilie Simon
        deadlineId: deadlines[11].id,
        visibility: CommentVisibility.PUBLIC
      },
      {
        content: 'J\'ai préparé les documents complémentaires demandés, ils sont prêts pour validation.',
        authorId: users[4].id, // Antoine Richard
        deadlineId: deadlines[11].id,
        visibility: CommentVisibility.PUBLIC
      }
    ];
    
    // Création des commentaires dans la base de données
    const comments = await Promise.all(
      commentData.map(comment => commentsService.create(comment))
    );
    console.log(`${comments.length} commentaires créés avec succès`);

    // ========== CRÉATION DES PIÈCES JOINTES ==========
    console.log('Création des pièces jointes fictives...');
    
    // Liste des pièces jointes
    const attachmentData: AttachmentSeedData[] = [
      // Pièces jointes pour la validation des plans
      {
        filename: 'plans_definitifs_mistral_v3.pdf',
        mimeType: 'application/pdf',
        size: 2845631,
        deadlineId: deadlines[0].id,
        uploaderId: users[0].id, // Jean Dupont
        classification: 'Confidentiel Défense'
      },
      {
        filename: 'rapport_validation_technique.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 548975,
        deadlineId: deadlines[0].id,
        uploaderId: managers[0].id, // Pierre Durand
        classification: 'Confidentiel Défense'
      },
      
      // Pièces jointes pour la commande des matériaux
      {
        filename: 'bon_commande_acier_naval.pdf',
        mimeType: 'application/pdf',
        size: 156842,
        deadlineId: deadlines[1].id,
        uploaderId: users[1].id, // Marie Bernard
        classification: 'Restreint'
      },
      {
        filename: 'specifications_alliages.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 248562,
        deadlineId: deadlines[1].id,
        uploaderId: users[0].id, // Jean Dupont
        classification: 'Restreint'
      },
      
      // Pièces jointes pour l'entrée en cale sèche
      {
        filename: 'photos_inspection_initiale.zip',
        mimeType: 'application/zip',
        size: 15482635,
        deadlineId: deadlines[5].id,
        uploaderId: users[2].id, // Paul Petit
        classification: 'Restreint'
      },
      {
        filename: 'rapport_evaluation_coque.pdf',
        mimeType: 'application/pdf',
        size: 3589412,
        deadlineId: deadlines[5].id,
        uploaderId: managers[1].id, // Sophie Martin
        classification: 'Secret Défense'
      },
      
      // Pièces jointes pour le plan de démantèlement
      {
        filename: 'plan_demantelement_v2.pdf',
        mimeType: 'application/pdf',
        size: 4582163,
        deadlineId: deadlines[10].id,
        uploaderId: managers[2].id, // Thomas Leroy
        classification: 'Restreint'
      },
      {
        filename: 'analyses_impact_environnemental.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 2845631,
        deadlineId: deadlines[10].id,
        uploaderId: users[4].id, // Antoine Richard
        classification: 'Restreint'
      },
      
      // Pièces jointes pour l'obtention des autorisations environnementales
      {
        filename: 'formulaires_autorisation_remplis.pdf',
        mimeType: 'application/pdf',
        size: 3586241,
        deadlineId: deadlines[11].id,
        uploaderId: users[5].id, // Émilie Simon
        classification: 'Public'
      },
      {
        filename: 'etude_impact_environnemental.pdf',
        mimeType: 'application/pdf',
        size: 8542163,
        deadlineId: deadlines[11].id,
        uploaderId: users[4].id, // Antoine Richard
        classification: 'Restreint'
      }
    ];
    
    // Création des fichiers factices et des pièces jointes dans la base de données
    const attachments = await Promise.all(
      attachmentData.map(async attachment => {
        // Créer un fichier factice pour simuler un upload réel
        const filePath = createDummyFile(attachment.filename);
        
        // Créer la pièce jointe dans la base de données
        return attachmentsService.create({
          ...attachment,
          path: filePath
        });
      })
    );
    console.log(`${attachments.length} pièces jointes créées avec succès`);

    // ========== AFFICHAGE DU RÉCAPITULATIF ==========
    console.log('\n=== RÉCAPITULATIF DE L\'INITIALISATION DES DONNÉES ===');
    console.log(`Utilisateurs: ${allUsers.length}`);
    console.log(`Équipes: ${teams.length}`);
    console.log(`Projets: ${projects.length}`);
    console.log(`Échéances: ${deadlines.length}`);
    console.log(`Commentaires: ${comments.length}`);
    console.log(`Pièces jointes: ${attachments.length}`);
    
    console.log('\nDonnées d\'accès pour test:');
    console.log('- Administrateur: admin@naval-defense.fr / Admin@123');
    console.log('- Gestionnaire Construction: p.durand@naval-defense.fr / Manager@123');
    console.log('- Gestionnaire Rénovation: s.martin@naval-defense.fr / Manager@456');
    console.log('- Gestionnaire Démantèlement: t.leroy@naval-defense.fr / Manager@789');
    console.log('- Utilisateur standard: j.dupont@naval-defense.fr / User@123');

  } catch (error) {
    // Gestion des erreurs pendant l'initialisation
    console.error('Erreur lors de l\'initialisation des données:', error);
  } finally {
    // Fermeture propre de l'application
    await app.close();
  }
}

// Exécution de la fonction d'initialisation
bootstrap();