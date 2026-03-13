"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { ToolCard } from '@/components/ToolCard';
import { getTools, getCategories } from '@/lib/api';
import { motion } from 'framer-motion';

export default function Home() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;

      const toolsData = await getTools(params);
      setTools(toolsData);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };


  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar onSearch={handleSearch} />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            Resources for <span className="text-blue-600 dark:text-blue-400">Designers</span> & <span className="text-emerald-600 dark:text-emerald-400">Developers</span>
          </motion.h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            A curated collection of tools, directories, fonts, and inspirations to supercharge your creative workflow.
          </p>
        </header>

        <div className="mb-10 flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activeCategory === 'all' 
                ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900' 
                : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            All Tools
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.slug 
                  ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900' 
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool: any) => (
              <ToolCard key={tool._id} tool={tool} />
            ))}
          </div>
        )}
        
        {!loading && tools.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">No tools found</p>
            <p className="text-zinc-600 dark:text-zinc-400">Try a different category or search term.</p>
          </div>
        )}
      </div>
    </main>
  );
}
