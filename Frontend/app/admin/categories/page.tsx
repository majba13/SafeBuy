'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  parent?: string;
  children?: Category[];
}

export default function AdminCategoriesPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', icon: '', parent: '' });
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    if (!accessToken) return;
    apiFetch<Category[]>('/categories', { token: accessToken })
      .then(setCategories).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, [accessToken]);

  const save = async () => {
    if (!form.name.trim()) return;
    try {
      if (editing) {
        await apiFetch(`/admin/categories/${editing._id}`, { method: 'PATCH', body: JSON.stringify(form), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
        toast.success('Category updated');
      } else {
        await apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify(form), token: accessToken!, headers: { 'Content-Type': 'application/json' } });
        toast.success('Category created');
      }
      setForm({ name: '', icon: '', parent: '' });
      setEditing(null);
      setShowForm(false);
      load();
    } catch { toast.error('Failed'); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? This may affect products.')) return;
    try {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE', token: accessToken! });
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon || '', parent: cat.parent || '' });
    setShowForm(true);
  };

  const roots = categories.filter((c) => !c.parent);

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', icon: '', parent: '' }); setShowForm(!showForm); }} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
          <Plus size={15} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-3">
          <h2 className="font-semibold text-gray-900">{editing ? 'Edit Category' : 'New Category'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Icon (emoji or URL)</label>
              <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="📱" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Parent Category (optional)</label>
            <select value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">None (top-level)</option>
              {categories.filter((c) => !c.parent && c._id !== editing?._id).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm">Save</button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {roots.map((cat) => (
            <div key={cat._id} className="border-b last:border-0 border-gray-100">
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  {cat.icon && <span className="text-lg">{cat.icon.startsWith('http') ? <img src={cat.icon} className="w-5 h-5" alt="" /> : cat.icon}</span>}
                  <span className="font-medium text-gray-900">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-orange-500"><Edit size={14} /></button>
                  <button onClick={() => deleteCategory(cat._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              {/* Sub-categories */}
              {categories.filter((c) => c.parent === cat._id).map((sub) => (
                <div key={sub._id} className="flex items-center justify-between px-4 py-2 pl-10 bg-gray-50/50 border-t border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ChevronRight size={12} className="text-gray-400" />
                    {sub.icon && <span>{sub.icon}</span>}
                    {sub.name}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(sub)} className="text-gray-400 hover:text-orange-500"><Edit size={13} /></button>
                    <button onClick={() => deleteCategory(sub._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {roots.length === 0 && <p className="text-center text-gray-400 py-8">No categories yet.</p>}
        </div>
      )}
    </div>
  );
}
