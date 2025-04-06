/**
 * Contrôleur d'authentification
 * Gère les points d'accès (endpoints) pour l'authentification des utilisateurs.
 * @module AuthController
 */
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

/**
 * DTO pour la demande de connexion
 */
class LoginDto {
  /**
   * Email de l'utilisateur
   */
  email: string;
  
  /**
   * Mot de passe de l'utilisateur
   */
  password: string;
}

/**
 * DTO pour l'enregistrement d'un nouvel utilisateur
 */
class RegisterDto {
  /**
   * Prénom de l'utilisateur
   */
  firstName: string;
  
  /**
   * Nom de famille de l'utilisateur
   */
  lastName: string;
  
  /**
   * Email de l'utilisateur
   */
  email: string;
  
  /**
   * Mot de passe de l'utilisateur
   */
  password: string;
  
  /**
   * Département ou équipe (optionnel)
   */
  department?: string;
}

/**
 * DTO pour la réponse d'authentification
 */
class AuthResponseDto {
  /**
   * Token JWT d'accès
   */
  access_token: string;
  
  /**
   * Informations basiques sur l'utilisateur authentifié
   */
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

/**
 * Contrôleur d'authentification
 * Gère les opérations de connexion et d'enregistrement
 */
@ApiTags('auth') // Tag Swagger pour le regroupement des endpoints
@Controller('auth') // Préfixe de route
export class AuthController {
  /**
   * Constructeur du contrôleur
   * @param authService Service d'authentification
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint de connexion utilisateur
   * @param loginDto Données de connexion (email et mot de passe)
   * @returns Objet contenant le token JWT et les infos utilisateur
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Utilise le code 200 au lieu de 201 pour la connexion
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * Endpoint d'enregistrement d'un nouvel utilisateur
   * @param registerDto Données d'enregistrement de l'utilisateur
   * @returns L'utilisateur créé
   */
  @Post('register')
  @ApiOperation({ summary: 'Enregistrement d\'un nouvel utilisateur' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou email déjà utilisé' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}