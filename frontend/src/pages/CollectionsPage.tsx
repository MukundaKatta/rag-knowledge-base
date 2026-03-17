import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, FolderOpen, Save, X } from 'lucide-react';
import * as api from '@/lib/api';
import type { Collection } from '@/types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCollections = async () => {
    try {
      const data = await api.getCollections();
      setCollections(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await api.createCollection({ name, description });
      setName('');
      setDescription('');
      setShowCreate(false);
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.updateCollection(id, { name, description });
      setEditingId(null);
      setName('');
      setDescription('');
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection and all its documents?')) return;
    try {
      await api.deleteCollection(id);
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (c: Collection) => {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Collections</h2>
        <button
          onClick={() => {
            setShowCreate(true);
            setName('');
            setDescription('');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New Collection
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collection list */}
      <div className="space-y-3">
        {collections.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No collections yet. Create one to start uploading documents.
          </p>
        ) : (
          collections.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {editingId === c.id ? (
                <div className="space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(c.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg"
                    >
                      <Save size={14} /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-sm rounded-lg"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FolderOpen size={20} className="text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{c.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{c.description || 'No description'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {c.document_count} documents &middot; Created{' '}
                        {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(c)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
