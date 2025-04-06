/**
 * Contrôleur pour la gestion des utilisateurs
 * Gère les points d'accès (endpoints) pour les opérations CRUD sur les utilisateurs.
 * @module UsersController
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from './entities/user.entity';

/**
 * Contrôleur pour la gestion des utilisateurs
 * Fournit les endpoints pour les opérations CRUD sur les utilisateurs
 */
@ApiTags('users') // Tag Swagger pour le regroupement des endpoints
@ApiBearerAuth() // Indique que l'authentification Bearer est nécessaire
@UseGuards(JwtAuthGuard) // Protection des routes avec JWT
@Controller('users') // Préfixe de route
export class UsersController {
  /**
   * Constructeur du contrôleur
   * @param usersService Service de gestion des utilisateurs
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crée un nouvel utilisateur
   * @param createUserDto Données de l'utilisateur à créer
   * @returns L'utilisateur créé
   */
  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: User })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Récupère tous les utilisateurs
   * @returns Liste des utilisateurs
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Récupère un utilisateur par son ID
   * @param id ID de l'utilisateur à récupérer
   * @returns L'utilisateur trouvé
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Met à jour un utilisateur existant
   * @param id ID de l'utilisateur à mettre à jour
   * @param updateUserDto Données de mise à jour
   * @returns L'utilisateur mis à jour
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Supprime un utilisateur
   * @param id ID de l'utilisateur à supprimer
   * @returns Confirmation de suppression
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}