'use client';

import { useState, useEffect } from 'react';
import { getPrompts, deletePrompt } from '@/lib/database';
import { SavedPrompt } from '@/lib/storage-types';

interface SavedPromptsListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SavedPromptsList({ isOpen, onClose }: SavedPromptsListProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
    }
  }, [isOpen]);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const data = await getPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;
    await deletePrompt(id);
    setPrompts(prompts.filter(p => p.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Saved Prompts</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No saved prompts yet</div>
          ) : (
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="border border-gray-200 rounded-lg">
                  <div
                    onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
                    className="p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{prompt.project_name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(prompt.created_at).toLocaleDateString()} • {new Date(prompt.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(prompt.prompt_text);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-700"
                          title="Copy"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(prompt.id);
                          }}
                          className="p-2 text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedId === prompt.id && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <pre className="mt-3 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
                        {prompt.prompt_text}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
