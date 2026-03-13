"use client";

import React from 'react';
import { ExternalLink, Tag as TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ToolCardProps {
  tool: {
    _id: string;
    title: string;
    description: string;
    url: string;
    thumbnail?: string;
    category_id: { name: string; slug: string };
    tags: string[];
  };
}

export const ToolCard = ({ tool }: ToolCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {tool.thumbnail ? (
          <img 
            src={tool.thumbnail} 
            alt={tool.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            No Preview
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {tool.category_id?.name || 'Uncategorized'}
          </span>
        </div>
        
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {tool.title}
        </h3>
        
        <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {tool.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1">
            {tool.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                #{tag}
              </span>
            ))}
          </div>
          
          <a 
            href={tool.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Visit <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
