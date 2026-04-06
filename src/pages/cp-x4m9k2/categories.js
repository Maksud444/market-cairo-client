import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getI18nProps } from '../../lib/i18n';
import { withAdmin } from '../../hoc/withAdmin';
import { useAuthStore } from '../../lib/store';
import { adminAPI } from '../../lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiLogOut, FiX, FiCheck, FiGift, FiGrid } from 'react-icons/fi';
import toast from 'react-hot-toast';

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const ICONS = ['box', 'smartphone', 'monitor', 'shirt', 'sofa', 'utensils', 'book', 'camera', 'heart', 'star', 'tag', 'grid', 'gift', 'package', 'home', 'tool', 'baby', 'bicycle', 'car', 'music'];

function AdminCategories() {
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState('regular'); // 'regular' | 'donation'
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  // Modal state
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [subParentIdx, setSubParentIdx] = useState(null);

  const [form, setForm] = useState({ name: '', icon: 'box', slug: '', order: 0 });
  const [subForm, setSubForm] = useState({ name: '' });

  useEffect(() => { fetchCategories(); }, [tab]);

  const fetchCategories = async () => {
    setIsLoading(true);
    setExpanded({});
    try {
      const res = await adminAPI.getCategories(tab);
      if (res.data.success) setCategories(res.data.categories);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => { logout(); window.location.href = '/'; };

  const handleSeedCategories = async () => {
    try {
      const res = await adminAPI.seedCategories();
      toast.success(res.data.message);
      fetchCategories();
    } catch {
      toast.error('Failed to seed categories');
    }
  };

  // ─── Category CRUD ────────────────────────────────────────────────────────

  const openAddCategory = () => {
    setEditing(null);
    setForm({ name: '', icon: 'box', slug: '', order: categories.length });
    setModal('category');
  };

  const openEditCategory = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon || 'box', slug: cat.slug, order: cat.order || 0 });
    setModal('category');
  };

  const saveCategory = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    const slug = form.slug || slugify(form.name);
    try {
      if (editing) {
        await adminAPI.updateCategory(editing._id, { ...form, slug });
        toast.success('Category updated');
      } else {
        await adminAPI.createCategory({ ...form, slug, isDonation: tab === 'donation' });
        toast.success('Category created');
      }
      setModal(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category? This cannot be undone.')) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const toggleActive = async (cat) => {
    try {
      await adminAPI.updateCategory(cat._id, { isActive: !cat.isActive });
      fetchCategories();
    } catch {
      toast.error('Failed to update');
    }
  };

  // ─── Subcategory CRUD ─────────────────────────────────────────────────────

  const openAddSub = (catId) => {
    setParentId(catId);
    setEditing(null);
    setSubParentIdx(null);
    setSubForm({ name: '' });
    setModal('subcategory');
  };

  const openEditSub = (catId, subIdx, sub) => {
    setParentId(catId);
    setEditing({ ...sub, idx: subIdx });
    setSubParentIdx(null);
    setSubForm({ name: sub.name });
    setModal('subcategory');
  };

  const saveSub = async () => {
    if (!subForm.name.trim()) return toast.error('Name is required');
    const cat = categories.find(c => c._id === parentId);
    if (!cat) return;
    const subs = [...cat.subcategories];
    if (editing) {
      subs[editing.idx] = { ...subs[editing.idx], name: subForm.name };
    } else {
      subs.push({ name: subForm.name, subcategories: [] });
    }
    try {
      await adminAPI.updateCategory(parentId, { subcategories: subs });
      toast.success(editing ? 'Subcategory updated' : 'Subcategory added');
      setModal(null);
      fetchCategories();
    } catch {
      toast.error('Failed to save');
    }
  };

  const deleteSub = async (catId, subIdx) => {
    if (!confirm('Delete this subcategory?')) return;
    const cat = categories.find(c => c._id === catId);
    const subs = cat.subcategories.filter((_, i) => i !== subIdx);
    try {
      await adminAPI.updateCategory(catId, { subcategories: subs });
      toast.success('Subcategory deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ─── Sub-subcategory CRUD ─────────────────────────────────────────────────

  const openAddSubSub = (catId, subIdx) => {
    setParentId(catId);
    setSubParentIdx(subIdx);
    setEditing(null);
    setSubForm({ name: '' });
    setModal('subsubcategory');
  };

  const openEditSubSub = (catId, subIdx, subSubIdx, subSub) => {
    setParentId(catId);
    setSubParentIdx(subIdx);
    setEditing({ ...subSub, idx: subSubIdx });
    setSubForm({ name: subSub.name });
    setModal('subsubcategory');
  };

  const saveSubSub = async () => {
    if (!subForm.name.trim()) return toast.error('Name is required');
    const cat = categories.find(c => c._id === parentId);
    if (!cat) return;
    const subs = JSON.parse(JSON.stringify(cat.subcategories));
    const subSubs = subs[subParentIdx].subcategories || [];
    if (editing) {
      subSubs[editing.idx] = { name: subForm.name };
    } else {
      subSubs.push({ name: subForm.name });
    }
    subs[subParentIdx].subcategories = subSubs;
    try {
      await adminAPI.updateCategory(parentId, { subcategories: subs });
      toast.success(editing ? 'Updated' : 'Added');
      setModal(null);
      fetchCategories();
    } catch {
      toast.error('Failed to save');
    }
  };

  const deleteSubSub = async (catId, subIdx, subSubIdx) => {
    if (!confirm('Delete?')) return;
    const cat = categories.find(c => c._id === catId);
    const subs = JSON.parse(JSON.stringify(cat.subcategories));
    subs[subIdx].subcategories = subs[subIdx].subcategories.filter((_, i) => i !== subSubIdx);
    try {
      await adminAPI.updateCategory(catId, { subcategories: subs });
      toast.success('Deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const adminNav = [
    { href: '/cp-x4m9k2', label: 'Dashboard' },
    { href: '/cp-x4m9k2/users', label: 'Users' },
    { href: '/cp-x4m9k2/listings', label: 'Listings' },
    { href: '/cp-x4m9k2/verifications', label: 'Verifications' },
    { href: '/cp-x4m9k2/reports', label: 'Reports' },
    { href: '/cp-x4m9k2/categories', label: 'Categories', active: true },
    { href: '/cp-x4m9k2/admins', label: 'Admins' },
    { href: '/', label: 'View Site' },
  ];

  const isDonationTab = tab === 'donation';

  return (
    <div className="min-h-screen bg-gray-50">
      <Head><title>Categories - Admin</title></Head>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <FiLogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app">
          <nav className="flex gap-6 overflow-x-auto">
            {adminNav.map(n => (
              <Link key={n.href} href={n.href}
                className={`py-4 border-b-2 whitespace-nowrap text-sm font-medium transition-colors ${
                  n.active ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >{n.label}</Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Category Management</h2>
            <p className="text-sm text-gray-500 mt-1">Add categories, subcategories, and sub-subcategories</p>
          </div>
          <div className="flex items-center gap-2">
            {!isDonationTab && (
              <button onClick={handleSeedCategories}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Seed Defaults
              </button>
            )}
            <button onClick={openAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <FiPlus size={16} /> {isDonationTab ? 'Add Donation Category' : 'Add Category'}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
          <button
            onClick={() => setTab('regular')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'regular'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiGrid size={16} />
            Regular Categories
          </button>
          <button
            onClick={() => setTab('donation')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'donation'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiGift size={16} />
            Donation Categories
          </button>
        </div>

        {/* Tab description */}
        {isDonationTab && (
          <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl mb-6">
            <FiGift className="text-primary-600 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-sm font-medium text-primary-800">Donation Categories</p>
              <p className="text-xs text-primary-600 mt-0.5">
                These categories appear on the Donate page. Users select from these when posting a free item.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDonationTab ? 'bg-primary-100' : 'bg-gray-100'}`}>
              {isDonationTab ? <FiGift className="text-primary-600" size={22} /> : <FiGrid className="text-gray-400" size={22} />}
            </div>
            <p className="text-gray-500 mb-4">
              {isDonationTab ? 'No donation categories yet.' : 'No regular categories yet.'}
            </p>
            <button onClick={openAddCategory} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
              {isDonationTab ? 'Add First Donation Category' : 'Add First Category'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Category row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => toggleExpand(cat._id)} className="text-gray-400 hover:text-gray-600">
                    {expanded[cat._id] ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{cat.name}</span>
                      <span className="text-xs text-gray-400">/{cat.slug}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">{cat.icon}</span>
                      {isDonationTab && (
                        <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded font-medium">Donation</span>
                      )}
                      {!cat.isActive && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.subcategories?.length || 0} subcategories</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(cat)}
                      className={`text-xs px-2 py-1 rounded ${cat.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => openAddSub(cat._id)}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      + Sub
                    </button>
                    <button onClick={() => openEditCategory(cat)} className="p-1.5 text-gray-400 hover:text-primary-600">
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => deleteCategory(cat._id)} className="p-1.5 text-gray-400 hover:text-red-600">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expanded[cat._id] && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {cat.subcategories?.length === 0 && (
                      <p className="px-12 py-3 text-sm text-gray-400">No subcategories</p>
                    )}
                    {cat.subcategories?.map((sub, subIdx) => (
                      <div key={subIdx}>
                        {/* Subcategory row */}
                        <div className="flex items-center gap-3 px-8 py-2.5 border-b border-gray-100 last:border-b-0">
                          <button onClick={() => toggleExpand(`${cat._id}-${subIdx}`)} className="text-gray-400 hover:text-gray-600">
                            {expanded[`${cat._id}-${subIdx}`] ? <FiChevronDown size={15} /> : <FiChevronRight size={15} />}
                          </button>
                          <span className="flex-1 text-sm text-gray-700">{sub.name}</span>
                          <span className="text-xs text-gray-400">{sub.subcategories?.length || 0} sub-sub</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openAddSubSub(cat._id, subIdx)}
                              className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                            >
                              + Sub-sub
                            </button>
                            <button onClick={() => openEditSub(cat._id, subIdx, sub)} className="p-1 text-gray-400 hover:text-primary-600">
                              <FiEdit2 size={13} />
                            </button>
                            <button onClick={() => deleteSub(cat._id, subIdx)} className="p-1 text-gray-400 hover:text-red-600">
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Sub-subcategories */}
                        {expanded[`${cat._id}-${subIdx}`] && (
                          <div className="bg-white">
                            {sub.subcategories?.length === 0 && (
                              <p className="px-16 py-2 text-xs text-gray-400">No sub-subcategories</p>
                            )}
                            {sub.subcategories?.map((subsub, subsubIdx) => (
                              <div key={subsubIdx} className="flex items-center gap-3 px-16 py-2 border-b border-gray-50 last:border-b-0">
                                <span className="flex-1 text-xs text-gray-600">{subsub.name}</span>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => openEditSubSub(cat._id, subIdx, subsubIdx, subsub)} className="p-1 text-gray-400 hover:text-primary-600">
                                    <FiEdit2 size={12} />
                                  </button>
                                  <button onClick={() => deleteSubSub(cat._id, subIdx, subsubIdx)} className="p-1 text-gray-400 hover:text-red-600">
                                    <FiTrash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {modal === 'category'
                  ? (editing ? 'Edit Category' : isDonationTab ? 'Add Donation Category' : 'Add Category')
                  : modal === 'subcategory'
                  ? (editing ? 'Edit Subcategory' : 'Add Subcategory')
                  : (editing ? 'Edit Sub-subcategory' : 'Add Sub-subcategory')}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modal === 'category' ? (
                <>
                  {isDonationTab && !editing && (
                    <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg text-xs text-primary-700">
                      <FiGift size={14} />
                      This category will appear on the Donation page.
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                      className="input w-full"
                      placeholder="e.g. Clothes & Shoes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="input w-full"
                      placeholder="e.g. clothes-shoes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <select value={form.icon} onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))} className="input w-full">
                      {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                      className="input w-full"
                      min="0"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={subForm.name}
                    onChange={(e) => setSubForm({ name: e.target.value })}
                    className="input w-full"
                    placeholder="Subcategory name"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={modal === 'category' ? saveCategory : modal === 'subcategory' ? saveSub : saveSubSub}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
              >
                <FiCheck size={16} /> Save
              </button>
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async ({ locale }) => ({
  props: { ...(await getI18nProps(locale)) }
});

export default withAdmin(AdminCategories);
