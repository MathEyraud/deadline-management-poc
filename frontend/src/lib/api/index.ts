import api, { handleApiError } from './client';
import authService from './auth';
import deadlinesService from './deadlines';
import projectsService from './projects';
import teamsService from './teams';
import usersService from './users';
import commentsService from './comments';
import attachmentsService from './attachments';
import aiService from './ai';

/**
 * Exporte tous les services API de l'application
 */
export {
  api,
  handleApiError,
  authService,
  deadlinesService,
  projectsService,
  teamsService,
  usersService,
  commentsService,
  attachmentsService,
  aiService
};