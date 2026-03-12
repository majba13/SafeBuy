'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  subCategories?: { _id: string; name: string }[];
}

interface AiDescriptionResult {
  description: string;
  tags: string[];
  seoKeywords: string[];
}

export default function NewProductPage() {
  const router = useRouter();
  const { accessToken } = useAppSelector((s) => s.auth);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    subCategory: '',
    brand: '',
    sku: '',
    description: '',
    basePrice: '',
    discountPrice: '',
    stock: '',
    tags: '',
  });

  // Spec key-value pairs for AI description generation
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ]);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>('/categories')
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateSpec = (idx: number, field: 'key' | 'value', val: string) => {
    setSpecs((s) => s.map((sp, i) => (i === idx ? { ...sp, [field]: val } : sp)));
  };

  const addSpec = () => setSpecs((s) => [...s, { key: '', value: '' }]);
  const removeSpec = (idx: number) => setSpecs((s) => s.filter((_, i) => i !== idx));

  const generateAiDescription = async () => {
    if (!form.title.trim()) {
      toast.error('Enter a product title first');
      return;
    }

    const specsObj: Record<string, string> = {};
    specs.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) specsObj[key.trim()] = value.trim();
    });

    const categoryName =
      categories.find((c) => c._id === form.category)?.name ?? form.category ?? 'General';

    setAiLoading(true);
    try {
      const result = await apiFetch<AiDescriptionResult>('/ai/generate-description', {
        method: 'POST',
        token: accessToken!,
        body: { title: form.title, category: categoryName, specs: specsObj },
      });

      setForm((f) => ({
        ...f,
        description: result.description,
        tags: result.tags?.join(', ') ?? f.tags,
      }));
      setAiSuggested(true);
      toast.success('AI description generated!');
    } catch {
      toast.error('AI generation failed. Check your description manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title,
      category: form.category,
      subCategory: form.subCategory || undefined,
      brand: form.brand,
      sku: form.sku,
      description: form.description,
      basePrice: parseFloat(form.basePrice),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
      stock: parseInt(form.stock, 10) || 0,
      tags: tagsArray,
    };

    setSubmitting(true);
    try {
      await apiFetch('/sellers/products', {
        method: 'POST',
        token: accessToken,
        body: payload,
      });
      toast.success('Product created!');
      router.push('/seller/products');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c._id === form.category);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/seller/products" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              required
              placeholder="e.g. Samsung Galaxy A55 5G"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                value={form.category}
                onChange={set('category')}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedCategory?.subCategories?.length ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-category</label>
                <select
                  value={form.subCategory}
                  onChange={set('subCategory')}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">None</option>
                  {selectedCategory.subCategories.map((sc) => (
                    <option key={sc._id} value={sc._id}>{sc.name}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={set('brand')}
                placeholder="Samsung"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={set('sku')}
                placeholder="SKU-001"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </section>

        {/* AI Description Generator */}
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Product Description</h2>
            <button
              type="button"
              onClick={generateAiDescription}
              disabled={aiLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition"
            >
              {aiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {aiLoading ? 'Generating…' : 'AI Generate'}
            </button>
          </div>

          {/* Specs for AI context */}
          <div>
            <p className="text-xs text-gray-500 mb-2">
              Add key specs to improve AI description quality (optional)
            </p>
            <div className="space-y-2">
              {specs.map((sp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={sp.key}
                    onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                    placeholder="Spec (e.g. RAM)"
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <input
                    type="text"
                    value={sp.value}
                    onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 8GB)"
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  {specs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpec(idx)}
                      className="text-gray-400 hover:text-red-500 text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="text-sm text-orange-500 hover:underline"
              >
                + Add spec
              </button>
            </div>
          </div>

          {/* Description textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              {aiSuggested && (
                <span className="text-xs text-purple-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI generated — review before saving
                </span>
              )}
            </div>
            <textarea
              value={form.description}
              onChange={set('description')}
              required
              rows={6}
              placeholder="Describe your product…"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={set('tags')}
              placeholder="phone, android, samsung (comma separated)"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-400 mt-1">AI will suggest tags automatically when generating description.</p>
          </div>
        </section>

        {/* Pricing & Stock */}
        <section className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Pricing & Stock</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.basePrice}
                onChange={set('basePrice')}
                required
                placeholder="2500"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (৳)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.discountPrice}
                onChange={set('discountPrice')}
                placeholder="2200"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={set('stock')}
                required
                placeholder="50"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {form.basePrice && form.discountPrice && parseFloat(form.discountPrice) < parseFloat(form.basePrice) && (
            <p className="text-xs text-green-600">
              Discount: {Math.round((1 - parseFloat(form.discountPrice) / parseFloat(form.basePrice)) * 100)}% off
            </p>
          )}
        </section>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Creating…' : 'Create Product'}
          </button>
          <Link
            href="/seller/products"
            className="px-6 py-3 border rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
