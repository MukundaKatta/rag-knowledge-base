import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import * as api from '@/lib/api';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
    api.getAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await api.updateSettings({
        chunk_size: settings.chunk_size,
        chunk_overlap: settings.chunk_overlap,
        top_k: settings.top_k,
        rerank_top_k: settings.rerank_top_k,
        mmr_lambda: settings.mmr_lambda,
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
      });
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chunking */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">Document Chunking</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Chunk Size</label>
            <input
              type="number"
              value={settings.chunk_size}
              onChange={(e) => setSettings({ ...settings, chunk_size: parseInt(e.target.value) || 512 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Chunk Overlap</label>
            <input
              type="number"
              value={settings.chunk_overlap}
              onChange={(e) => setSettings({ ...settings, chunk_overlap: parseInt(e.target.value) || 50 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Retrieval */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">Retrieval</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Top-K Results</label>
            <input
              type="number"
              value={settings.top_k}
              onChange={(e) => setSettings({ ...settings, top_k: parseInt(e.target.value) || 10 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Rerank Top-K</label>
            <input
              type="number"
              value={settings.rerank_top_k}
              onChange={(e) => setSettings({ ...settings, rerank_top_k: parseInt(e.target.value) || 5 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">MMR Lambda ({settings.mmr_lambda.toFixed(2)})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.mmr_lambda}
              onChange={(e) => setSettings({ ...settings, mmr_lambda: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Diverse</span>
              <span>Relevant</span>
            </div>
          </div>
        </div>

        {/* LLM */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">LLM Settings</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Model</label>
            <input
              value={settings.llm_model}
              disabled
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Tokens</label>
            <input
              type="number"
              value={settings.max_tokens}
              onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) || 4096 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Temperature ({settings.temperature.toFixed(2)})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Embedding */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">Embedding Model</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Model</label>
            <input
              value={settings.embedding_model}
              disabled
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && <span className="text-sm text-green-600">Settings saved!</span>}
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">System Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Collections', value: analytics.collections },
              { label: 'Documents', value: analytics.documents },
              { label: 'Chunks', value: analytics.chunks },
              { label: 'Conversations', value: analytics.conversations },
              { label: 'Messages', value: analytics.messages },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{String(value ?? 0)}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
