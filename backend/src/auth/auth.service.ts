/**
 * Service d'authentification
 * Gère les opérations d'authentification, de validation des utilisateurs
 * et de génération de tokens JWT.
 * @module AuthService
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

/**
 * Service d'authentification
 * Fournit les méthodes pour valider les utilisateurs et gérer l'authentification
 */
@Injectable()
export class AuthService {
  /**
   * Constructeur du service d'authentification
   * @param usersService Service pour accéder aux données des utilisateurs
   * @param jwtService Service pour générer et valider les tokens JWT
   */
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valide les identifiants d'un utilisateur
   * @param email Email de l'utilisateur
   * @param password Mot de passe en clair
   * @returns L'utilisateur validé sans son mot de passe ou null si invalide
   */
  async validateUser(email: string, password: string): Promise<any> {
    // Récupère l'utilisateur avec son mot de passe (normalement exclu des requêtes)
    const user = await this.usersService.findByEmail(email, true);
    
    // Vérifie si l'utilisateur existe et si le mot de passe correspond
    if (user && await bcrypt.compare(password, user.password)) {
      // Destructuration pour exclure le mot de passe de l'objet retourné
      const { password, ...result } = user;
      return result;
    }
    
    // Retourne null si l'authentification échoue
    return null;
  }

  /**
   * Authentifie un utilisateur et génère un token JWT
   * @param email Email de l'utilisateur
   * @param password Mot de passe en clair
   * @returns Objet contenant le token d'accès et les informations de l'utilisateur
   * @throws UnauthorizedException si les identifiants sont invalides
   */
  async login(email: string, password: string) {
    // Valide l'utilisateur
    const user = await this.validateUser(email, password);
    
    // Si l'utilisateur n'est pas valide, lance une exception
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    
    // Crée un payload pour le token JWT
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    // Retourne le token et les informations de base de l'utilisateur
    return {
      access_token: this.jwtService.sign(payload), // Génère le token JWT
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Enregistre un nouvel utilisateur
   * @param user Données de l'utilisateur à enregistrer
   * @returns L'utilisateur créé
   */
  async register(user: any) {
    return this.usersService.create(user);
  }
}