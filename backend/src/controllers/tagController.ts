import { Request, Response } from 'express';
import Tool from '../models/Tool';

export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tools = await Tool.find({}, 'tags');
    const tags = Array.from(new Set(tools.flatMap(t => t.tags)));
    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
