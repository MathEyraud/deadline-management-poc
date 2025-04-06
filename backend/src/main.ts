/**
 * Point d'entrée principal de l'application Nest.js
 * Ce fichier initialise le serveur, configure les middleware globaux
 * et lance l'application sur le port spécifié.
 * @module main
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Fonction principale de bootstrap qui initialise et configure l'application
 * @async
 */
async function bootstrap() {
  // Création du dossier data s'il n'existe pas (pour la base de données SQLite)
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // Création de l'instance de l'application NestJS
  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS pour permettre les requêtes du frontend
  app.enableCors({
    origin: 'http://localhost:3001', // Autoriser le frontend Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Autorise l'envoi de cookies et headers d'authentification
  });
  
  // Configuration du pipe de validation global
  // - whitelist: supprime les propriétés qui n'ont pas de décorateurs
  // - transform: transforme automatiquement les types primitifs
  // - forbidNonWhitelisted: rejette les requêtes avec des propriétés non autorisées
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Configuration de la documentation Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('API de Gestion d\'Échéances')
    .setDescription('API pour l\'application de gestion d\'échéances du secteur défense')
    .setVersion('1.0')
    .addBearerAuth() // Ajoute la configuration d'authentification par token Bearer
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Route d'accès à la documentation
  
  // Sauvegarde de la spécification OpenAPI pour usage externe (ex: génération de clients)
  fs.writeFileSync(
    './openapi-spec.json',
    JSON.stringify(document, null, 2)
  );
  
  // Démarrage du serveur sur le port 3000
  await app.listen(3000);
  console.log(`Application running on: ${await app.getUrl()}`);
}

// Exécution de la fonction bootstrap
bootstrap();