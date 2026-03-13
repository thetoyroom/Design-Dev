import express from 'express';
import { getAllTags } from '../controllers/tagController';

const router = express.Router();

router.get('/', getAllTags);

export default router;
