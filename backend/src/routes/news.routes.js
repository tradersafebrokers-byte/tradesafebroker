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

// Admin-only overview
router.get('/admin/all', verifyJWT, requireAdmin, getAllAdminNews);

// News creation & management (Admins can manage any; authenticated users can publish community analysis)
router.post('/', verifyJWT, createNewsArticle);
router.put('/:id', verifyJWT, updateNewsArticle);
router.patch('/:id', verifyJWT, updateNewsArticle);
router.delete('/:id', verifyJWT, deleteNewsArticle);

// Public route for single article (placed after specific routes like /admin/all)
router.get('/:slugOrId', getNewsArticleBySlugOrId);

export default router;
