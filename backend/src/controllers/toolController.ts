import { Request, Response } from 'express';
import Tool from '../models/Tool';
import Category from '../models/Category';
import { getMetadata } from '../services/metadataService';

export const getAllTools = async (req: Request, res: Response) => {
  try {
    const { category, tag, search } = req.query;
    let query: any = {};
    
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category_id = cat._id;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    const tools = await Tool.find(query).populate('category_id').sort({ createdAt: -1 });
    res.json(tools);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getToolById = async (req: Request, res: Response) => {
  try {
    const tool = await Tool.findById(req.params.id).populate('category_id');
    if (!tool) return res.status(404).json({ message: 'Tool not found' });
    res.json(tool);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTool = async (req: Request, res: Response) => {
  try {
    const { url, category_id, tags, source } = req.body;
    
    // Fetch metadata automatically
    const metadata = await getMetadata(url);
    
    const tool = new Tool({
      title: metadata?.title || req.body.title || 'Untitled',
      description: metadata?.description || req.body.description || '',
      url,
      thumbnail: metadata?.thumbnail || req.body.thumbnail || '',
      category_id,
      tags: tags || [],
      source,
    });
    
    const newTool = await tool.save();
    res.status(201).json(newTool);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTool = async (req: Request, res: Response) => {
  try {
    const updatedTool = await Tool.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTool);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTool = async (req: Request, res: Response) => {
  try {
    await Tool.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tool deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
