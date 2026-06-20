import { useState, useRef, useEffect } from "react";
import { createProduct, fetchCategory } from "../services/authService";

const EMPTY = {
    name: "", slug: "", category: "", description: "", shortDescription: "",
    brand: "Frrit", regularPrice: "", salePrice: "", sku: "", stock: "",
    hasVariants: false, tags: "", status: "draft", featured: false,
    seoTitle: "", seoDescription: "",
};

export default function CreateProduct() {
    const [form, setForm] = useState(EMPTY);
    const [mainImage, setMainImage] = useState(null);
    const [mainPreview, setMainPreview] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [variants, setVariants] = useState([{ size: "", color: "", sku: "", stock: "" }]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const mainRef = useRef(null);
    const galleryRef = useRef(null);

    useEffect(() => {
        fetchCategory()
            .then(res => {
                setCategories(
                    Array.isArray(res.data?.categories)
                        ? res.data.categories
                        : []
                );
            })
            .catch(console.error);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setForm(p => ({ ...p, name, slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") }));
    };

    const handleMainImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setMainImage(file);
        setMainPreview(URL.createObjectURL(file));
    };

    const removeMain = () => {
        if (mainPreview) URL.revokeObjectURL(mainPreview);

        setMainImage(null);
        setMainPreview(null);

        if (mainRef.current) mainRef.current.value = "";
        if (galleryRef.current) galleryRef.current.value = "";
    };

    const handleGalleryAdd = (e) => {
        const files = Array.from(e.target.files);
        const newItems = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setGallery(p => [...p, ...newItems]);
        if (galleryRef.current) galleryRef.current.value = "";
    };

    const removeGalleryItem = (i) => {
        URL.revokeObjectURL(gallery[i].preview);

        setGallery(prev =>
            prev.filter((_, idx) => idx !== i)
        );
    };

    const handleVariantChange = (i, field, val) =>
        setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));

    const addVariant = () => setVariants(p => [...p, { size: "", color: "", sku: "", stock: "" }]);
    const removeVariant = (i) => setVariants(p => p.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Basic Validation
            if (!form.name.trim()) {
                return alert("Product name is required");
            }

            if (!form.category) {
                return alert("Category is required");
            }

            if (!form.description.trim()) {
                return alert("Description is required");
            }

            if (!form.regularPrice) {
                return alert("Regular price is required");
            }

            if (!mainImage) {
                return alert("Main product image is required");
            }

            // Variant Validation
            if (form.hasVariants) {
                if (variants.length === 0) {
                    return alert("At least one variant is required");
                }

                const skuSet = new Set();

                for (const variant of variants) {
                    if (!variant.sku?.trim()) {
                        return alert("All variants must have SKU");
                    }

                    if (skuSet.has(variant.sku.trim())) {
                        return alert("Variant SKUs must be unique");
                    }

                    skuSet.add(variant.sku.trim());
                }
            }

            setLoading(true);

            const payload = new FormData();

            // Form fields
            Object.entries(form).forEach(([key, value]) => {
                payload.append(key, value);
            });

            // Main Image
            payload.append("images", mainImage);

            // Gallery Images
            gallery.forEach((item) => {
                payload.append("images", item.file);
            });

            // Variants
            if (form.hasVariants) {
                payload.append("variants", JSON.stringify(variants));
            }

            const response = await createProduct(payload);

            alert(response?.data?.message || "Product created successfully");

            // Cleanup previews
            if (mainPreview) {
                URL.revokeObjectURL(mainPreview);
            }

            gallery.forEach((g) => {
                URL.revokeObjectURL(g.preview);
            });

            // Reset Form
            setForm(EMPTY);
            setMainImage(null);
            setMainPreview(null);
            setGallery([]);
            setVariants([
                {
                    size: "",
                    color: "",
                    sku: "",
                    stock: "",
                },
            ]);

            if (mainRef.current) {
                mainRef.current.value = "";
            }

            if (galleryRef.current) {
                galleryRef.current.value = "";
            }

        } catch (err) {
            console.error(err);

            const errors = err?.response?.data?.errors;

            if (errors) {
                alert(Object.values(errors).join("\n"));
            } else {
                alert(
                    err?.response?.data?.message ||
                    "Failed to create product"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-base font-semibold text-gray-800">Add New Product</h1>
                    <p className="text-xs text-gray-400">Fill in the details to list a product</p>
                </div>
                <button type="submit" disabled={loading}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-1.5">
                    {loading && <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
                    {loading ? "Publishing…" : "Publish Product"}
                </button>
            </div>

            <div className="flex gap-5 items-start">

                {/* LEFT COLUMN */}
                <div className="flex-1 min-w-0 space-y-4">

                    <Section title="Basic Info">
                        <Field label="Product Name" required>
                            <input type="text" name="name" value={form.name} onChange={handleNameChange} placeholder="e.g. Classic Cotton Tee" required className={input} />
                        </Field>
                        <Field label="Slug" required>
                            <input type="text" name="slug" value={form.slug} onChange={handleChange} required className={`${input} font-mono bg-gray-50`} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Category" required>
                                <select name="category" value={form.category} onChange={handleChange} required className={input}>
                                    <option value="">Select category</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.parent?.name
                                                ? `${c.parent.name} → ${c.name}`
                                                : c.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Brand">
                                <input type="text" name="brand" value={form.brand} onChange={handleChange} className={input} />
                            </Field>
                        </div>
                        <Field label="Short Description">
                            <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows="2" placeholder="One-line product summary…" className={`${input} resize-none`} />
                        </Field>
                        <Field label="Description" required>
                            <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Full product description…" required className={`${input} resize-none`} />
                        </Field>
                    </Section>

                    <Section title="Pricing & Stock">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Regular Price (₹)" required>
                                <input type="number" name="regularPrice" value={form.regularPrice} onChange={handleChange} min="0" placeholder="0" required className={input} />
                            </Field>
                            <Field label="Sale Price (₹)">
                                <input type="number" name="salePrice" value={form.salePrice} onChange={handleChange} min="0" placeholder="0" className={input} />
                            </Field>
                        </div>
                        {!form.hasVariants && (
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="SKU">
                                    <input type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="SKU-001" className={`${input} font-mono`} />
                                </Field>
                                <Field label="Stock">
                                    <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" placeholder="0" className={input} />
                                </Field>
                            </div>
                        )}
                    </Section>

                    <Section title="Variants">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="hasVariants" checked={form.hasVariants} onChange={handleChange} className="w-3.5 h-3.5 rounded border-gray-300 text-slate-700" />
                            <span className="text-sm text-gray-700">This product has size / color variants</span>
                        </label>
                        {form.hasVariants && (
                            <div className="space-y-2 mt-1">
                                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 px-1">
                                    <span>Size</span><span>Color</span><span>SKU</span><span>Stock</span>
                                </div>
                                {variants.map((v, i) => (
                                    <div key={i} className="grid grid-cols-4 gap-2 items-center">
                                        <input value={v.size} onChange={e => handleVariantChange(i, "size", e.target.value)} placeholder="M" className={inputSm} />
                                        <input value={v.color} onChange={e => handleVariantChange(i, "color", e.target.value)} placeholder="Red" className={inputSm} />
                                        <input value={v.sku} onChange={e => handleVariantChange(i, "sku", e.target.value)} placeholder="SKU-M-R" required={form.hasVariants} className={`${inputSm} font-mono`} />
                                        <div className="flex gap-1.5">
                                            <input type="number" value={v.stock} onChange={e => handleVariantChange(i, "stock", e.target.value)} placeholder="0" min="0" className={inputSm} />
                                            {variants.length > 1 && (
                                                <button type="button" onClick={() => removeVariant(i)} className="text-gray-300 hover:text-red-400 shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addVariant} className="text-xs text-slate-600 border border-dashed border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 w-full">
                                    + Add Variant
                                </button>
                            </div>
                        )}
                    </Section>

                    <Section title="Tags & SEO">
                        <Field label="Tags" hint="Comma separated">
                            <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="cotton, summer, casual" className={input} />
                        </Field>
                        <Field label="SEO Title">
                            <input type="text" name="seoTitle" value={form.seoTitle} onChange={handleChange} className={input} />
                        </Field>
                        <Field label="SEO Description">
                            <textarea name="seoDescription" value={form.seoDescription} onChange={handleChange} rows="2" className={`${input} resize-none`} />
                        </Field>
                    </Section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="w-64 shrink-0 space-y-4">

                    <Section title="Publish">
                        <Field label="Status">
                            <select name="status" value={form.status} onChange={handleChange} className={input}>
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </Field>
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-3.5 h-3.5 rounded border-gray-300 text-slate-700" />
                            <span className="text-sm text-gray-700">Featured product</span>
                        </label>
                    </Section>

                    {/* Main Image — single */}
                    <Section title={<>Main Image <span className="text-red-500">*</span></>}>
                        <p className="text-xs text-gray-400 -mt-1 mb-2">Primary photo · 800×800px</p>
                        {!mainPreview ? (
                            <div onClick={() => mainRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center cursor-pointer hover:border-slate-400 hover:bg-gray-50 transition-colors">
                                <ImgIcon />
                                <p className="text-xs text-slate-600 font-medium">Click to upload</p>
                                <p className="text-xs text-gray-300 mt-0.5">PNG, JPG, WEBP</p>
                            </div>
                        ) : (
                            <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                                <img src={mainPreview} alt="Main" className="w-full h-40 object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                                <button type="button" onClick={removeMain}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow">✕</button>
                                <button type="button" onClick={() => mainRef.current?.click()}
                                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white text-xs text-gray-700 px-3 py-1 rounded-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                    Change
                                </button>
                            </div>
                        )}
                        <input ref={mainRef} type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
                    </Section>

                    {/* Gallery — multiple */}
                    <Section title="Gallery Images">
                        <p className="text-xs text-gray-400 -mt-1 mb-2">Featured & extra photos · 1200×630px</p>

                        {/* Existing thumbnails */}
                        {gallery.length > 0 && (
                            <div className="grid grid-cols-3 gap-1.5 mb-2">
                                {gallery.map((g, i) => (
                                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                        <img src={g.preview} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeGalleryItem(i)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
                                        {i === 0 && (
                                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">Cover</span>
                                        )}
                                    </div>
                                ))}

                                {/* Add more tile */}
                                <div onClick={() => galleryRef.current?.click()}
                                    className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-gray-50 transition-colors">
                                    <span className="text-xl text-gray-300 leading-none">+</span>
                                    <span className="text-xs text-gray-400 mt-0.5">Add</span>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {gallery.length === 0 && (
                            <div onClick={() => galleryRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center cursor-pointer hover:border-slate-400 hover:bg-gray-50 transition-colors">
                                <ImgIcon />
                                <p className="text-xs text-slate-600 font-medium">Click to upload</p>
                                <p className="text-xs text-gray-400 mt-0.5">Select multiple files</p>
                                <p className="text-xs text-gray-300 mt-0.5">PNG, JPG, WEBP</p>
                            </div>
                        )}

                        <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGalleryAdd} className="hidden" />
                        {gallery.length > 0 && (
                            <p className="text-xs text-gray-400 text-center">{gallery.length} image{gallery.length > 1 ? "s" : ""} · first marked as cover</p>
                        )}
                    </Section>

                </div>
            </div>
        </form>
    );
}

const input = "w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300 bg-white";
const inputSm = "w-full text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300";

function Section({ title, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</p>
            </div>
            <div className="px-4 py-3 space-y-3">{children}</div>
        </div>
    );
}

function Field({ label, required, hint, children }) {
    return (
        <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                {label}
                {required && <span className="text-red-500">*</span>}
                {hint && <span className="text-gray-400 font-normal">· {hint}</span>}
            </label>
            {children}
        </div>
    );
}

function ImgIcon() {
    return (
        <svg className="w-6 h-6 text-gray-300 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586A2 2 0 0111 11h2a2 2 0 011.414.586L19 16M14 8a2 2 0 11-4 0 2 2 0 014 0zM5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
    );
}