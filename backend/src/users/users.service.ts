/**
 * Service de gestion des utilisateurs
 * Gère la logique métier et l'accès aux données pour les utilisateurs.
 * @module UsersService
 */
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * Service pour la gestion des utilisateurs
 * Fournit les méthodes CRUD et logique métier pour les utilisateurs
 */
@Injectable()
export class UsersService {
  /**
   * Constructeur du service
   * @param usersRepository Repository TypeORM pour les utilisateurs
   */
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Crée un nouvel utilisateur
   * @param createUserDto Données de l'utilisateur à créer
   * @returns Promise contenant l'utilisateur créé (sans mot de passe)
   * @throws ConflictException si l'email est déjà utilisé
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    // Si l'email existe déjà, lever une exception
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hacher le mot de passe avant stockage (10 rounds de salage)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Créer le nouvel utilisateur avec mot de passe haché
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Sauvegarder l'utilisateur dans la base de données
    const savedUser = await this.usersRepository.save(newUser);
    
    // Extraire le mot de passe et retourner le reste des propriétés
    // Cette technique crée un nouvel objet sans modifier l'original
    const { password, ...userWithoutPassword } = savedUser;
    
    // Retourner l'utilisateur sans exposer le mot de passe
    return userWithoutPassword as User;
  }

  /**
   * Récupère tous les utilisateurs
   * @returns Promise contenant la liste des utilisateurs
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Récupère un utilisateur par son ID
   * @param id ID de l'utilisateur à récupérer
   * @returns Promise contenant l'utilisateur trouvé
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    
    // Si l'utilisateur n'existe pas, lever une exception
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID "${id}" non trouvé`);
    }
    
    return user;
  }

  /**
   * Récupère un utilisateur par son email
   * @param email Email de l'utilisateur à récupérer
   * @param includePassword Indique si le mot de passe doit être inclus (pour l'authentification)
   * @returns Promise contenant l'utilisateur trouvé
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async findByEmail(email: string, includePassword = false): Promise<User> {
    // Création d'un query builder pour personnaliser la requête
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .where('user.email = :email', { email });
      
    // Ajout optionnel du mot de passe (normalement exclu des requêtes)
    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }
    
    const user = await queryBuilder.getOne();
    
    // Si l'utilisateur n'existe pas, lever une exception
    if (!user) {
      throw new NotFoundException(`Utilisateur avec email "${email}" non trouvé`);
    }
    
    return user;
  }

  /**
   * Met à jour un utilisateur existant
   * @param id ID de l'utilisateur à mettre à jour
   * @param updateUserDto Données de mise à jour
   * @returns Promise contenant l'utilisateur mis à jour (sans mot de passe)
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // Si le mot de passe est mis à jour, le hacher
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Mettre à jour seulement les champs fournis
    Object.assign(user, updateUserDto);
    
    // Sauvegarder les modifications
    const updatedUser = await this.usersRepository.save(user);
    
    // Extraire le mot de passe et retourner le reste des propriétés
    // Cette technique crée un nouvel objet sans modifier l'original
    const { password, ...userWithoutPassword } = updatedUser;
    
    // Retourner l'utilisateur mis à jour sans exposer le mot de passe
    return userWithoutPassword as User;
  }

  /**
   * Supprime un utilisateur
   * @param id ID de l'utilisateur à supprimer
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}