import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sitemapService } from './sitemap.service';

export const sitemapRouter = Router();

sitemapRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const xml = await sitemapService.generate();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  })
);