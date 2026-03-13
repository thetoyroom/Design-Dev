import express from 'express';
import { getAllTools, getToolById, createTool, updateTool, deleteTool } from '../controllers/toolController';

const router = express.Router();

router.get('/', getAllTools);
router.get('/:id', getToolById);
router.post('/', createTool);
router.put('/:id', updateTool);
router.delete('/:id', deleteTool);

export default router;
