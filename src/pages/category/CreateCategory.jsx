import { useState, useRef, useEffect } from "react";
import { createCategory, deleteCategory, fetchCategory, updateCategory } from "../../services/authService";

export default function CreateCategory() {
    const [formData, setFormData] = useState({ name: "", slug: "", description: "", image: null, status: true });
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
            const response = await fetchCategory();
            setCategories(response.data?.categories || response.data || []);
        } catch {
            setCategories([]);
        } finally {
            setListLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData((prev) => ({
            ...prev,
            name,
            slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""),
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData((prev) => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: null }));
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Switch form into Edit mode, pre-fill fields
    const handleEditClick = (cat) => {
        setEditingId(cat._id);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            image: null, // file input reset; existing image shown via preview
            status: cat.status,
        });
        // Show existing image as preview (it's a URL string from server)
        setPreview(cat.image || null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Cancel edit → back to create mode
    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", slug: "", description: "", image: null, status: true });
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== null) payload.append(key, val);
            });

            if (editingId) {
                // ── EDIT ──
                const response = await updateCategory(editingId, payload);
                alert(response.data.message);
                handleCancelEdit();
            } else {
                // ── CREATE ──
                const response = await createCategory(payload);
                alert(response.data.message);
                setFormData({ name: "", slug: "", description: "", image: null, status: true });
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }

            fetchCategories();
        } catch (error) {
            alert(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await deleteCategory(id);
            setCategories((prev) => prev.filter((c) => c._id !== id));
            // If deleting the one being edited, reset form
            if (editingId === id) handleCancelEdit();
        } catch {
            alert("Failed to delete category");
        }
    };

    const isEditing = !!editingId;

    return (
        <div className="flex gap-6 items-start">

            {/* ── LEFT: Form (Create / Edit) ── */}
            <div className="w-full max-w-sm shrink-0">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

                    {/* Header — changes based on mode */}
                    <div className={`px-5 py-4 border-b border-gray-200 flex items-start justify-between ${isEditing ? "bg-amber-50" : ""}`}>
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">
                                {isEditing ? "Edit Category" : "Create Category"}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isEditing ? "Update the category details below" : "Add a new product category"}
                            </p>
                        </div>
                        {isEditing && (
                            <button
                                onClick={handleCancelEdit}
                                className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 rounded px-2 py-1 hover:bg-white transition-colors mt-0.5"
                            >
                                ✕ Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleNameChange}
                                placeholder="e.g. Electronics"
                                required
                                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="electronics"
                                required
                                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Brief description..."
                                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder-gray-400 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
                            {!preview ? (
                                <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-md py-5 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-gray-50 transition-colors" >
                                    <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586A2 2 0 0111 11h2a2 2 0 011.414.586L19 16M14 8a2 2 0 11-4 0 2 2 0 014 0zM5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                    <p className="text-xs text-gray-500"><span className="font-medium text-slate-700">Click to upload</span></p>
                                    <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                                </div>
                            ) : (
                                <div className="relative w-20 h-20 group">
                                    <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                                    >✕</button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-md transition-all flex items-center justify-center"
                                    >
                                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">Change</span>
                                    </button>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={formData.status}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-slate-700 focus:ring-slate-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`text-white text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${isEditing
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "bg-slate-900 hover:bg-slate-700"
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        {isEditing ? "Saving…" : "Creating…"}
                                    </span>
                                ) : isEditing ? "Save Changes" : "Create"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* ── RIGHT: Category List ── */}
            <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">All Categories</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {categories.length} {categories.length === 1 ? "category" : "categories"} total
                            </p>
                        </div>
                        <button onClick={fetchCategories} className="text-xs text-slate-600 hover:text-slate-900 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors" >
                            ↻ Refresh
                        </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {listLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                <svg className="animate-spin w-5 h-5 mb-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <span className="text-sm">Loading…</span>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h18" />
                                </svg>
                                <p className="text-sm">No categories yet</p>
                                <p className="text-xs mt-1">Create one using the form</p>
                            </div>
                        ) : (
                            categories.map((cat) => (
                                <div key={cat._id} className={`flex items-center gap-4 px-5 py-3 transition-colors ${editingId === cat._id
                                        ? "bg-amber-50 border-l-2 border-amber-400"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-10 h-10 rounded-md border border-gray-200 overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586A2 2 0 0111 11h2a2 2 0 011.414.586L19 16M14 8a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{cat.name}</p>
                                        <p className="text-xs text-gray-400 truncate">/{cat.slug}</p>
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 border ${cat.status
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                        }`}>
                                        {cat.status ? "Active" : "Inactive"}
                                    </span>

                                    {/* Edit */}
                                    <button
                                        onClick={() => handleEditClick(cat)}
                                        className={`p-1.5 rounded transition-colors shrink-0 ${editingId === cat._id
                                            ? "text-amber-600 bg-amber-100"
                                            : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                                            }`}
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>

                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}