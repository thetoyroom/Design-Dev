"use client";

import React, { useState, useEffect } from "react";
import { api, getCategories, getTools } from "@/lib/api";
import { Plus, Trash, Edit, ExternalLink } from "lucide-react";

type Category = {
  _id: string;
  name: string;
};

type Tool = {
  _id?: string;
  title?: string;
  url: string;
  thumbnail?: string;
  category_id?: Category;
  tags?: string[];
};

export default function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTool, setNewTool] = useState({
    url: "",
    category_id: "",
    tags: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toolsData, catsData] = await Promise.all([
          getTools(),
          getCategories(),
        ]);

        setTools(toolsData);
        setCategories(catsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post<Tool>("/tools", {
        ...newTool,
        tags: newTool.tags.split(",").map((t) => t.trim()),
      });

      setTools([response.data, ...tools]);

      setNewTool({
        url: "",
        category_id: "",
        tags: "",
      });
    } catch (err) {
      alert("Error adding tool");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    try {
      await api.delete(`/tools/${id}`);

      setTools(tools.filter((t) => t._id !== id));
    } catch (err) {
      alert("Error deleting tool");
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Tools</h1>

        <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Plus size={18} /> Bulk Import
        </button>
      </div>

      <div className="mb-12 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold">Add New Tool</h2>

        <form
          onSubmit={handleAddTool}
          className="grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Website URL
            </label>

            <input
              type="url"
              required
              placeholder="https://example.com"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              value={newTool.url}
              onChange={(e) =>
                setNewTool({ ...newTool, url: e.target.value })
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>

            <select
              required
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              value={newTool.category_id}
              onChange={(e) =>
                setNewTool({ ...newTool, category_id: e.target.value })
              }
            >
              <option value="">Select Category</option>

              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Tool
            </button>
          </div>

          <div className="md:col-span-4">
            <label className="mb-1 block text-sm font-medium">
              Tags (comma separated)
            </label>

            <input
              type="text"
              placeholder="minimal, productivity, sass"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              value={newTool.tags}
              onChange={(e) =>
                setNewTool({ ...newTool, tags: e.target.value })
              }
            />
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 font-semibold">Tool</th>
              <th className="px-6 py-3 font-semibold">Category</th>
              <th className="px-6 py-3 font-semibold">Tags</th>
              <th className="px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {tools.map((tool) => (
              <tr key={tool._id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {tool.thumbnail && (
                      <img
                        src={tool.thumbnail}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}

                    <div>
                      <div className="font-medium">{tool.title}</div>

                      <a
                        href={tool.url}
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-600"
                      >
                        {tool.url}
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    {tool.category_id?.name}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {tool.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] text-zinc-500"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(tool._id!)}
                      className="text-zinc-400 hover:text-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}