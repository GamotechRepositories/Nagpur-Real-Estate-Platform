import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Search,
  Languages,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  Globe,
  Tag,
  BookOpen,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import apiClient from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import PhotoUploader, { getFullImageUrl } from '../../components/common/PhotoUploader';
import { formatDate } from '../../utils/formatters';

const CATEGORIES = [
  { id: 'ALL', label: 'All Content' },
  { id: 'BLOG', label: 'Blog Posts', icon: BookOpen },
  { id: 'LOCALITY_GUIDE', label: 'Area Guides', icon: MapPin },
  { id: 'FAQ', label: 'FAQs', icon: HelpCircle },
];

const LANGUAGES = [
  { id: 'ALL', label: 'All Languages' },
  { id: 'en', label: 'English' },
  { id: 'mr', label: 'Marathi (मराठी)' },
  { id: 'hi', label: 'Hindi (हिंदी)' },
];

export const ContentManagementPage = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeLang, setActiveLang] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'BLOG',
    language: 'en',
    excerpt: '',
    content: '',
    coverImage: '',
    seoTitle: '',
    seoDescription: '',
    isPublished: true,
  });

  const { data: contentList, isLoading } = useQuery({
    queryKey: ['admin-content-list', activeCategory, activeLang, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== 'ALL') params.append('category', activeCategory);
      if (activeLang !== 'ALL') params.append('language', activeLang);
      if (search.trim()) params.append('search', search.trim());

      const res = await apiClient.get(`/content/admin/all?${params.toString()}`);
      return res.data?.data || [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload) => {
      return apiClient.post('/content', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-content-list']);
      setModalOpen(false);
      setEditingContent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-content-list']);
    },
  });

  const handleOpenAdd = () => {
    setEditingContent(null);
    setFormData({
      title: '',
      slug: '',
      category: activeCategory !== 'ALL' ? activeCategory : 'BLOG',
      language: activeLang !== 'ALL' ? activeLang : 'en',
      excerpt: '',
      content: '',
      coverImage: '',
      seoTitle: '',
      seoDescription: '',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingContent(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      category: item.category || 'BLOG',
      language: item.language || 'en',
      excerpt: item.excerpt || '',
      content: item.content || '',
      coverImage: item.coverImage || '',
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      isPublished: item.isPublished ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    upsertMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Content Management"
        subtitle="Publish and maintain Nagpur real estate blog posts, area guides, and FAQs"
        icon={FileText}
        breadcrumbs={[{ label: 'Content' }]}
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Content</span>
          </button>
        }
      />

      {/* Category Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Language Filter */}
        <div className="flex items-center space-x-1 pr-1">
          <Languages className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={activeLang}
            onChange={(e) => setActiveLang(e.target.value)}
            className="py-1 px-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by article title, slug, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : contentList && contentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentList.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              {item.coverImage && (
                <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={getFullImageUrl(item.coverImage)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="py-0.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                      {item.category?.replace(/_/g, ' ') || 'Blog'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center space-x-1">
                    <span className="py-0.5 px-1.5 rounded bg-teal-600 text-white text-[10px] font-mono font-bold uppercase shadow-xs">
                      {item.language || 'en'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-2 flex-1">
                {!item.coverImage && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center space-x-1 py-0.5 px-2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {item.category?.replace(/_/g, ' ') || 'Blog'}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <span className="py-0.5 px-1.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold uppercase">
                        {item.language || 'en'}
                      </span>
                      {item.isPublished ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Published" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" title="Draft" />
                      )}
                    </div>
                  </div>
                )}

                <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                {item.excerpt && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{formatDate(item.createdAt)}</span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                    title="Edit Content"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${item.title}"?`)) {
                        deleteMutation.mutate(item._id);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                    title="Delete Content"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No content found"
          description="Create your first blog post, area guide, or FAQ to engage Nagpur home seekers."
        />
      )}

      {/* Add / Edit Content Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingContent ? 'Edit Content' : 'Publish New Content'}
          subtitle="Supports multi-lingual articles, guides, and FAQs"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Why Besa & Wardha Road are Nagpur's Top Investment Hubs"
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-900 outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white outline-none"
                >
                  <option value="BLOG">Blog Article</option>
                  <option value="LOCALITY_GUIDE">Locality Area Guide</option>
                  <option value="FAQ">Frequently Asked Question</option>
                  <option value="STATIC_PAGE">Static Page</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white outline-none"
                >
                  <option value="en">English (en)</option>
                  <option value="mr">Marathi (mr - मराठी)</option>
                  <option value="hi">Hindi (hi - हिंदी)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Excerpt (Short Summary)
              </label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A brief 1-2 sentence preview for search cards and social shares..."
                className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-800 outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Full Content *
              </label>
              <textarea
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full article body, FAQ answer, or locality description here..."
                className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-800 outline-none focus:border-teal-600 font-mono text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  SEO Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Meta title for Google ranking..."
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Publish Immediately (Make Visible)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="py-2 px-3.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={upsertMutation.isPending}
                className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
              >
                {upsertMutation.isPending ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ContentManagementPage;
