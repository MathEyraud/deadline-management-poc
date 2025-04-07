/**
 * Point d'entrée centralisé pour tous les services API
 * Facilite l'importation des services dans les composants
 * @module api
 */
import api from './client';
import authService from './auth';
import usersService from './users';
import teamsService from './teams';
import projectsService from './projects';
import deadlinesService from './deadlines';
import commentsService from './comments';
import attachmentsService from './attachments';
import aiService from './ai';
import { handleApiError, getReadableErrorMessage } from './errorHandler';

export {
  api as default,
  authService,
  usersService,
  teamsService,
  projectsService,
  deadlinesService,
  commentsService,
  attachmentsService,
  aiService,
  handleApiError,
  getReadableErrorMessage,
};