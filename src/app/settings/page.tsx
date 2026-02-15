'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Key, Trash2, Loader2, Eye, EyeOff, Plus } from 'lucide-react';

interface ApiKeyEntry {
  id: string;
  provider: string;
  label: string | null;
  apiKey: string;
  createdAt: string;
}

const PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini', description: 'For LLM text generation' },
  { value: 'transloadit', label: 'Transloadit', description: 'For image/video processing' },
  { value: 'trigger', label: 'Trigger.dev', description: 'For background task execution' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());

  // Form state
  const [formProvider, setFormProvider] = useState('gemini');
  const [formApiKey, setFormApiKey] = useState('');
  const [formLabel, setFormLabel] = useState('');

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/api-keys');
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
    } catch {
      console.error('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleSave = async () => {
    if (!formApiKey.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formProvider,
          apiKey: formApiKey,
          label: formLabel || undefined,
        }),
      });
      if (res.ok) {
        setFormApiKey('');
        setFormLabel('');
        setShowForm(false);
        await fetchKeys();
      }
    } catch {
      console.error('Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this API key?')) return;
    try {
      await fetch(`/api/settings/api-keys?id=${id}`, { method: 'DELETE' });
      await fetchKeys();
    } catch {
      console.error('Failed to delete API key');
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#a0a0a0] hover:text-white transition-colors p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-[#a0a0a0] text-sm mt-1">Manage your API keys for external services</p>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-[#141414] border border-[#222222] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-[#8b5cf6]" />
              <h2 className="text-lg font-semibold">API Keys</h2>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 text-sm bg-[#8b5cf6] text-white px-3 py-1.5 rounded-lg hover:bg-[#7c3aed] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Key
            </button>
          </div>

          <p className="text-[#a0a0a0] text-sm mb-6">
            Your API keys are used instead of the server defaults. Keys are stored securely and never shared.
          </p>

          {/* Add Key Form */}
          {showForm && (
            <div className="bg-[#0a0a0a] border border-[#333333] rounded-lg p-4 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Provider</label>
                  <select
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6]"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label} — {p.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1">API Key</label>
                  <input
                    type="password"
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1">Label (optional)</label>
                  <input
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="e.g. My personal key"
                    className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !formApiKey.trim()}
                    className="flex items-center gap-2 text-sm bg-[#8b5cf6] text-white px-4 py-2 rounded-lg hover:bg-[#7c3aed] transition-colors disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                    Save Key
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-sm text-[#a0a0a0] hover:text-white px-4 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Keys List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#a0a0a0]" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-[#a0a0a0]">
              <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No API keys configured. Server defaults will be used.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => {
                const provider = PROVIDERS.find((p) => p.value === key.provider);
                return (
                  <div
                    key={key.id}
                    className="flex items-center justify-between bg-[#0a0a0a] border border-[#222222] rounded-lg p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{provider?.label || key.provider}</span>
                        {key.label && (
                          <span className="text-xs text-[#a0a0a0] bg-[#1a1a1a] px-2 py-0.5 rounded">
                            {key.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-[#a0a0a0] font-mono">
                          {showKeys.has(key.id) ? key.apiKey : key.apiKey}
                        </code>
                        <button
                          onClick={() => toggleShowKey(key.id)}
                          className="text-[#a0a0a0] hover:text-white"
                        >
                          {showKeys.has(key.id) ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="text-[#a0a0a0] hover:text-red-400 p-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}