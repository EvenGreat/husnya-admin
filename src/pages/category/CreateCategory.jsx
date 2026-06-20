import { useState, useRef, useEffect } from "react";
import { createCategory, deleteCategory, fetchCategory, updateCategory } from "../../services/authService";

export default function CreateCategory() {
    const [formData, setFormData] = useState({ name: "", slug: "", description: "", parent: "", image: null, status: true });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            setListLoading(true);
            const res = await fetchCategory();
            setCategories(res.data?.categories || res.data || []);
        } catch { setCategories([]); }
        finally { setListLoading(false); }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(p => ({ ...p, name, slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData(p => ({ ...p, image: file }));
        setPreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setFormData(p => ({ ...p, image: null }));
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEditClick = (cat) => {
        setEditingId(cat._id);
        setFormData({ name: cat.name, slug: cat.slug, description: cat.description || "", image: null, parent: cat.parent?._id || cat.parent || "", status: cat.status });
        setPreview(cat.image || null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", slug: "", description: "", parent: "", image: null, status: true });
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = new FormData();
            Object.entries(formData).forEach(([k, v]) => { if (v !== null) payload.append(k, v); });
            if (editingId) {
                const res = await updateCategory(editingId, payload);
                alert(res.data.message);
                handleCancelEdit();
            } else {
                const res = await createCategory(payload);
                alert(res.data.message);
                setFormData({ name: "", slug: "", description: "", image: null, status: true });
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
            fetchCategories();
        } catch (err) {
            alert(err?.response?.data?.message || "Something went wrong");
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category?")) return;

        try {
            const response = await deleteCategory(id);
            alert(response.data.message);
            setCategories(prev => prev.filter(c => c._id !== id));
            if (editingId === id) {
                handleCancelEdit();
            }
        } catch (error) {
            alert(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete category"
            );
        }
    };

    // Build tree: parents → children map
    const parents = categories.filter(c => !c.parent);
    const childrenOf = (id) => categories.filter(c => (c.parent?._id || c.parent) === id);

    const isEditing = !!editingId;

    return (
        <div className="flex gap-5 items-start">

            {/* Form */}
            <div className="w-72 shrink-0">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className={`px-4 py-3 border-b border-gray-200 flex items-center justify-between ${isEditing ? "bg-amber-50 border-amber-200" : "bg-gray-50"}`}>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{isEditing ? "Edit Category" : "New Category"}</p>
                            <p className="text-xs text-gray-400">{isEditing ? "Update details below" : "Add a product category"}</p>
                        </div>
                        {isEditing && (
                            <button onClick={handleCancelEdit} className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 rounded-md px-2 py-1 bg-white hover:bg-gray-50">
                                ✕ Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Parent Category</label>
                            <select name="parent" value={formData.parent} onChange={handleChange}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white">
                                <option value="">— None (Top Level) —</option>
                                {categories.filter(c => c._id !== editingId).map(c => (
                                    <option key={c._id} value={c._id}>{c.parent ? `  ↳ ${c.name}` : c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleNameChange} placeholder="e.g. Electronics" required
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300" />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Slug <span className="text-red-500">*</span></label>
                            <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="electronics" required
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300 font-mono" />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Brief description…"
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300 resize-none" />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                            {!preview ? (
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-lg py-4 flex flex-col items-center cursor-pointer hover:border-slate-400 hover:bg-gray-50 transition-colors">
                                    <svg className="w-5 h-5 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586A2 2 0 0111 11h2a2 2 0 011.414.586L19 16M14 8a2 2 0 11-4 0 2 2 0 014 0zM5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                    <p className="text-xs text-gray-400"><span className="text-slate-600 font-medium">Click to upload</span> · PNG, JPG, WEBP</p>
                                </div>
                            ) : (
                                <div className="relative w-16 h-16 group">
                                    <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                    <button type="button" onClick={handleRemoveImage}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600">✕</button>
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">Change</span>
                                    </button>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" name="status" checked={formData.status} onChange={handleChange}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-slate-700 focus:ring-slate-400" />
                                <span className="text-sm text-gray-600">Active</span>
                            </label>
                            <button type="submit" disabled={loading}
                                className={`text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 ${isEditing ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-800 hover:bg-slate-700"}`}>
                                {loading && <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
                                {loading ? (isEditing ? "Saving…" : "Creating…") : (isEditing ? "Save Changes" : "Create")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Category Tree List */}
            <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">All Categories</p>
                            <p className="text-xs text-gray-400">{categories.length} {categories.length === 1 ? "category" : "categories"}</p>
                        </div>
                        <button onClick={fetchCategories} className="text-xs text-slate-600 hover:text-slate-900 border border-gray-200 rounded-md px-2 py-1 hover:bg-white transition-colors">
                            ↻ Refresh
                        </button>
                    </div>

                    {listLoading ? (
                        <div className="py-10 flex flex-col items-center text-gray-400">
                            <svg className="animate-spin w-5 h-5 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                            <span className="text-sm">Loading…</span>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="py-10 flex flex-col items-center text-gray-400">
                            <p className="text-sm">No categories yet</p>
                            <p className="text-xs mt-0.5">Create one using the form</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {parents.map((parent) => {
                                const children = childrenOf(parent._id);
                                const isEditingParent = editingId === parent._id;
                                return (
                                    <div key={parent._id}>
                                        {/* Parent Row */}
                                        <div className={`flex items-center gap-3 px-4 py-2.5 ${isEditingParent ? "bg-amber-50 border-l-2 border-amber-400" : "hover:bg-gray-50"}`}>
                                            <div className="w-8 h-8 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                                {parent.image
                                                    ? <img src={parent.image} alt={parent.name} className="w-full h-full object-cover" />
                                                    : <span className="text-xs font-semibold text-gray-400 uppercase">{parent.name.charAt(0)}</span>
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{parent.name}</p>
                                                    {children.length > 0 && (
                                                        <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{children.length}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 font-mono truncate">/{parent.slug}</p>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${parent.status ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                                                {parent.status ? "Active" : "Inactive"}
                                            </span>
                                            <button onClick={() => handleEditClick(parent)} title="Edit"
                                                className={`p-1.5 rounded-lg transition-colors shrink-0 ${isEditingParent ? "text-amber-600 bg-amber-100" : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"}`}>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => handleDelete(parent._id)} title="Delete"
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>

                                        {/* Children Rows */}
                                        {children.map((child, idx) => {
                                            const isEditingChild = editingId === child._id;
                                            const isLast = idx === children.length - 1;
                                            return (
                                                <div key={child._id} className={`flex items-center gap-3 pl-8 pr-4 py-2 ${isEditingChild ? "bg-amber-50 border-l-2 border-amber-400" : "bg-gray-50 hover:bg-gray-100"}`}>
                                                    {/* Tree connector */}
                                                    <div className="flex items-center shrink-0 text-gray-300">
                                                        <span className="text-sm">{isLast ? "└" : "├"}</span>
                                                    </div>
                                                    <div className="w-7 h-7 rounded-md border border-gray-200 overflow-hidden bg-white flex items-center justify-center shrink-0">
                                                        {child.image
                                                            ? <img src={child.image} alt={child.name} className="w-full h-full object-cover" />
                                                            : <span className="text-xs font-semibold text-gray-300 uppercase">{child.name.charAt(0)}</span>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-700 truncate">{child.name}</p>
                                                        <p className="text-xs text-gray-400 font-mono truncate">/{child.slug}</p>
                                                    </div>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${child.status ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                                                        {child.status ? "Active" : "Inactive"}
                                                    </span>
                                                    <button onClick={() => handleEditClick(child)} title="Edit"
                                                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${isEditingChild ? "text-amber-600 bg-amber-100" : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"}`}>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(child._id)} title="Delete"
                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}

                            {/* Orphan children (parent deleted/missing) */}
                            {categories.filter(c => c.parent && !parents.find(p => p._id === (c.parent?._id || c.parent))).map(cat => {
                                const isEditingCat = editingId === cat._id;
                                return (
                                    <div key={cat._id} className={`flex items-center gap-3 px-4 py-2.5 ${isEditingCat ? "bg-amber-50 border-l-2 border-amber-400" : "hover:bg-gray-50"}`}>
                                        <div className="w-8 h-8 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                                            {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : <span className="text-xs font-semibold text-gray-400 uppercase">{cat.name.charAt(0)}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{cat.name}</p>
                                            <p className="text-xs text-gray-400 font-mono truncate">/{cat.slug}</p>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${cat.status ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                                            {cat.status ? "Active" : "Inactive"}
                                        </span>
                                        <button onClick={() => handleEditClick(cat)} className={`p-1.5 rounded-lg shrink-0 ${isEditingCat ? "text-amber-600 bg-amber-100" : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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