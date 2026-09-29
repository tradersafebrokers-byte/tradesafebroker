import { Router } from 'express';
import {
  getPublishedNews,
  getNewsArticleBySlugOrId,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  getAllAdminNews,
} from '../controllers/news.controller.js';
import { verifyJWT, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getPublishedNews);

// Admin-only management endpoints
router.get('/admin/all', verifyJWT, requireAdmin, getAllAdminNews);
router.post('/', verifyJWT, requireAdmin, createNewsArticle);
router.put('/:id', verifyJWT, requireAdmin, updateNewsArticle);
router.patch('/:id', verifyJWT, requireAdmin, updateNewsArticle);
router.delete('/:id', verifyJWT, requireAdmin, deleteNewsArticle);

// Public route for single article (placed after specific routes like /admin/all)
router.get('/:slugOrId', getNewsArticleBySlugOrId);

export default router;
