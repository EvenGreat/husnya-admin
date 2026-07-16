import { useState, useRef, useEffect } from "react";
import { createProduct, fetchCategory, getAllCollection } from "../services/authService";
import JoditInput from "../component/JoditInput";

const EMPTY = {
    name: "", slug: "", category: "", collection: "", description: "", shortDescription: "",
    brand: "Frrit", regularPrice: "", salePrice: "", sku: "", stock: "",
    hasVariants: false, tags: "", status: "draft", featured: false,
    seoTitle: "", seoDescription: "",
};

const emptySizeRow = () => ({ size: "", sku: "", stock: "" });
const emptyColorGroup = () => ({
    id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    color: "",
    images: [],           // { file, preview } - newly picked, per color
    existingImages: [],   // urls already saved on the server for this color (edit mode)
    removedImages: [],    // urls the user removed from this color (edit mode)
    sizes: [emptySizeRow()],
});

export default function ProductForm({ productId }) {
    const isEdit = Boolean(productId);

    const [form, setForm] = useState(EMPTY);
    const [mainImage, setMainImage] = useState(null);
    const [mainPreview, setMainPreview] = useState(null);

    const [existingMainImage, setExistingMainImage] = useState(null);
    const [existingGallery, setExistingGallery] = useState([]);
    const [removedExistingImages, setRemovedExistingImages] = useState([]);

    const [gallery, setGallery] = useState([]);

    // Variants are now grouped by color. Each group owns its own images + size rows.
    const [colorVariants, setColorVariants] = useState([emptyColorGroup()]);

    const [categories, setCategories] = useState([]);
    const [collection, setCollection] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);

    const mainRef = useRef(null);
    const galleryRef = useRef(null);

    useEffect(() => {
        fetchCategory()
            .then(res => setCategories(Array.isArray(res.data?.categories) ? res.data.categories : []))
            .catch(console.error);
    }, []);

    useEffect(() => {
        const fetCollection = async () => {
            try {
                const rs = await getAllCollection();
                setCollection(
                    Array.isArray(rs.data?.collections)
                        ? rs.data.collections
                        : []
                );
            } catch (error) {
                console.error(error);
            }
        }
        fetCollection();
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setForm(p => ({
            ...p,
            name,
            slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""),
        }));
    };

    // ── Main image ────────────────────────────────────────────────────────────
    const handleMainImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (mainPreview) URL.revokeObjectURL(mainPreview);
        setMainImage(file);
        setMainPreview(URL.createObjectURL(file));
        // Once a new file is chosen the existing server image is replaced
        setExistingMainImage(null);
    };

    const removeMain = () => {
        if (mainPreview) URL.revokeObjectURL(mainPreview);
        setMainImage(null);
        setMainPreview(null);
        if (existingMainImage) {
            setRemovedExistingImages(p => [...p, existingMainImage]);
            setExistingMainImage(null);
        }
        if (mainRef.current) mainRef.current.value = "";
    };

    const hasMainImage = mainPreview || existingMainImage;
    const mainDisplaySrc = mainPreview ?? existingMainImage;

    // ── Gallery (only used when the product has no variants) ───────────────────
    const handleGalleryAdd = (e) => {
        const files = Array.from(e.target.files);
        const newItems = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setGallery(p => [...p, ...newItems]);
        if (galleryRef.current) galleryRef.current.value = "";
    };

    const removeGalleryItem = (i) => {
        URL.revokeObjectURL(gallery[i].preview);
        setGallery(prev => prev.filter((_, idx) => idx !== i));
    };

    const removeExistingGalleryItem = (url) => {
        setExistingGallery(p => p.filter(u => u !== url));
        setRemovedExistingImages(p => [...p, url]);
    };

    const totalGalleryCount = existingGallery.length + gallery.length;

    // ── Color variants ───────────────────────────────────────────────────────
    const addColorGroup = () => setColorVariants(p => [...p, emptyColorGroup()]);

    const removeColorGroup = (gi) => {
        setColorVariants(prev => {
            prev[gi]?.images.forEach(img => URL.revokeObjectURL(img.preview));
            return prev.filter((_, i) => i !== gi);
        });
    };

    const updateColorName = (gi, value) =>
        setColorVariants(prev => prev.map((g, i) => (i === gi ? { ...g, color: value } : g)));

    const addSizeRow = (gi) =>
        setColorVariants(prev => prev.map((g, i) =>
            i === gi ? { ...g, sizes: [...g.sizes, emptySizeRow()] } : g
        ));

    const removeSizeRow = (gi, si) =>
        setColorVariants(prev => prev.map((g, i) =>
            i === gi ? { ...g, sizes: g.sizes.filter((_, idx) => idx !== si) } : g
        ));

    const updateSizeField = (gi, si, field, val) =>
        setColorVariants(prev => prev.map((g, i) =>
            i === gi
                ? { ...g, sizes: g.sizes.map((s, idx) => (idx === si ? { ...s, [field]: val } : s)) }
                : g
        ));

    const handleVariantImageAdd = (gi, fileList) => {
        const files = Array.from(fileList);
        const newItems = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setColorVariants(prev => prev.map((g, i) =>
            i === gi ? { ...g, images: [...g.images, ...newItems] } : g
        ));
    };

    const removeVariantImage = (gi, ii) => {
        setColorVariants(prev => prev.map((g, i) => {
            if (i !== gi) return g;
            URL.revokeObjectURL(g.images[ii].preview);
            return { ...g, images: g.images.filter((_, idx) => idx !== ii) };
        }));
    };

    const removeExistingVariantImage = (gi, url) => {
        setColorVariants(prev => prev.map((g, i) =>
            i === gi
                ? {
                    ...g,
                    existingImages: g.existingImages.filter(u => u !== url),
                    removedImages: [...g.removedImages, url],
                }
                : g
        ));
    };

    const resetColorVariants = () => {
        colorVariants.forEach(g => g.images.forEach(img => URL.revokeObjectURL(img.preview)));
        setColorVariants([emptyColorGroup()]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) return alert("Product name is required");
        if (!form.category) return alert("Category is required");
        if (!form.description.trim()) return alert("Description is required");
        if (!form.regularPrice) return alert("Regular price is required");

        if (!isEdit && !mainImage) return alert("Main product image is required");

        if (form.hasVariants) {
            if (colorVariants.length === 0) return alert("At least one color variant is required");

            const skuSet = new Set();
            for (const group of colorVariants) {
                const colorLabel = group.color.trim() || "a variant";
                if (!group.color.trim()) return alert("Every variant needs a color name");

                const totalImages = group.existingImages.length + group.images.length;
                if (totalImages === 0) return alert(`Add at least one image for "${colorLabel}"`);

                if (group.sizes.length === 0) return alert(`Add at least one size for "${colorLabel}"`);

                for (const s of group.sizes) {
                    if (!s.sku?.trim()) return alert(`All sizes for "${colorLabel}" must have a SKU`);
                    if (skuSet.has(s.sku.trim())) return alert("Variant SKUs must be unique across all colors");
                    skuSet.add(s.sku.trim());
                }
            }
        }

        setLoading(true);

        try {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => payload.append(key, value));

            if (mainImage) payload.append("images", mainImage);

            if (form.hasVariants) {
                // Color/size metadata goes up as JSON; each color's photos ride under
                // their own field name so the backend can match them back up.
                const variantsPayload = colorVariants.map(g => ({
                    color: g.color,
                    sizes: g.sizes,
                }));
                payload.append("variants", JSON.stringify(variantsPayload));

                colorVariants.forEach((g, gi) => {
                    g.images.forEach(img => payload.append(`variantImages_${gi}`, img.file));
                });

                if (isEdit) {
                    const removedVariantImages = colorVariants.flatMap(g => g.removedImages);
                    if (removedVariantImages.length) {
                        payload.append("removedVariantImages", JSON.stringify(removedVariantImages));
                    }
                }
            } else {
                // General gallery only applies to non-variant products
                gallery.forEach(item => payload.append("images", item.file));
            }

            if (isEdit && removedExistingImages.length) {
                payload.append("removedImages", JSON.stringify(removedExistingImages));
            }

            const response = await createProduct(payload);

            alert(response?.data?.message || (isEdit ? "Product updated successfully" : "Product created successfully"));

            if (!isEdit) {
                if (mainPreview) URL.revokeObjectURL(mainPreview);
                gallery.forEach(g => URL.revokeObjectURL(g.preview));

                setForm(EMPTY);
                setMainImage(null);
                setMainPreview(null);
                setGallery([]);
                resetColorVariants();
                if (mainRef.current) mainRef.current.value = "";
                if (galleryRef.current) galleryRef.current.value = "";
            } else {
                gallery.forEach(g => URL.revokeObjectURL(g.preview));
                setGallery([]);
                setMainImage(null);
                setRemovedExistingImages([]);
                colorVariants.forEach(g => g.images.forEach(img => URL.revokeObjectURL(img.preview)));
                setColorVariants(prev => prev.map(g => ({ ...g, images: [], removedImages: [] })));
                if (mainRef.current) mainRef.current.value = "";
                if (galleryRef.current) galleryRef.current.value = "";
            }
        } catch (err) {
            console.error(err);
            const errors = err?.response?.data?.errors;
            if (errors) alert(Object.values(errors).join("\n"));
            else alert(err?.response?.data?.message || (isEdit ? "Failed to update product" : "Failed to create product"));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-48" />
                <div className="h-64 bg-gray-100 rounded-xl" />
                <div className="h-40 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-base font-semibold text-gray-800">
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </h1>
                    <p className="text-xs text-gray-400">
                        {isEdit ? "Update the details below" : "Fill in the details to list a product"}
                    </p>
                </div>
                <button type="submit" disabled={loading}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-1.5">
                    {loading && (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    )}
                    {loading
                        ? (isEdit ? "Saving…" : "Publishing…")
                        : (isEdit ? "Save Changes" : "Publish Product")}
                </button>
            </div>

            <div className="flex gap-5 items-start">

                {/* ── LEFT COLUMN ────────────────────────────────────────── */}
                <div className="flex-1 min-w-0 space-y-4">

                    <Section title="Basic Info">
                        <Field label="Product Name" required>
                            <input type="text" name="name" value={form.name} onChange={handleNameChange}
                                placeholder="e.g. Classic Cotton Tee" required className={input} />
                        </Field>
                        <Field label="Slug" required>
                            <input type="text" name="slug" value={form.slug} onChange={handleChange}
                                required className={`${input} font-mono bg-gray-50`} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Category" required>
                                <select name="category" value={form.category} onChange={handleChange} required className={input}>
                                    <option value="">Select category</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.parent?.name ? `${c.parent.name} → ${c.name}` : c.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Collection">
                                <select
                                    name="collection"
                                    value={form.collection}
                                    onChange={handleChange}
                                    className={input}
                                >
                                    <option value="">Select Collection</option>
                                    {collection.map(item => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Brand">
                                <input type="text" name="brand" value={form.brand} onChange={handleChange} className={input} />
                            </Field>
                        </div>

                        <Field label="Short Description">
                            <JoditInput
                                height={180}
                                value={form.shortDescription}
                                onChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        shortDescription: value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="Description" required>
                            <JoditInput
                                value={form.description}
                                onChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        description: value,
                                    }))
                                }
                            />
                        </Field>
                    </Section>

                    <Section title="Pricing & Stock">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Regular Price (₹)" required>
                                <input type="number" name="regularPrice" value={form.regularPrice} onChange={handleChange}
                                    min="0" placeholder="0" required className={input} />
                            </Field>
                            <Field label="Sale Price (₹)">
                                <input type="number" name="salePrice" value={form.salePrice} onChange={handleChange}
                                    min="0" placeholder="0" className={input} />
                            </Field>
                        </div>
                        {!form.hasVariants && (
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="SKU">
                                    <input type="text" name="sku" value={form.sku} onChange={handleChange}
                                        placeholder="SKU-001" className={`${input} font-mono`} />
                                </Field>
                                <Field label="Stock">
                                    <input type="number" name="stock" value={form.stock} onChange={handleChange}
                                        min="0" placeholder="0" className={input} />
                                </Field>
                            </div>
                        )}
                        {form.hasVariants && (
                            <p className="text-xs text-gray-400">
                                SKU and stock are tracked per size, inside each color variant below.
                            </p>
                        )}
                    </Section>

                    <Section title="Variants">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="hasVariants" checked={form.hasVariants} onChange={handleChange}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-slate-700" />
                            <span className="text-sm text-gray-700">This product has color / size variants</span>
                        </label>

                        {form.hasVariants && (
                            <div className="space-y-4 mt-2">
                                {colorVariants.map((group, gi) => {
                                    const totalGroupImages = group.existingImages.length + group.images.length;
                                    return (
                                        <div key={group.id} className="border border-gray-200 rounded-xl p-3 space-y-3 bg-gray-50/60">
                                            <div className="flex items-center justify-between gap-2">
                                                <input
                                                    value={group.color}
                                                    onChange={e => updateColorName(gi, e.target.value)}
                                                    placeholder="Color e.g. Red"
                                                    required
                                                    className={`${inputSm} font-medium max-w-[220px] bg-white`}
                                                />
                                                {colorVariants.length > 1 && (
                                                    <button type="button" onClick={() => removeColorGroup(gi)}
                                                        className="text-gray-300 hover:text-red-400 shrink-0">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Color-specific images */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">
                                                    Images for {group.color.trim() || "this color"}
                                                    {totalGroupImages === 0 && <span className="text-red-400"> · required</span>}
                                                </p>
                                                <div className="grid grid-cols-5 gap-1.5">
                                                    {group.existingImages.map((url, ii) => (
                                                        <div key={`existing-${ii}`}
                                                            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">Saved</span>
                                                            <button type="button" onClick={() => removeExistingVariantImage(gi, url)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
                                                        </div>
                                                    ))}
                                                    {group.images.map((img, ii) => (
                                                        <div key={`new-${ii}`}
                                                            className="relative group aspect-square rounded-lg overflow-hidden border border-blue-200 bg-gray-100">
                                                            <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                                            <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded leading-tight">New</span>
                                                            <button type="button" onClick={() => removeVariantImage(gi, ii)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
                                                        </div>
                                                    ))}
                                                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-white transition-colors">
                                                        <span className="text-lg text-gray-300 leading-none">+</span>
                                                        <input type="file" accept="image/*" multiple className="hidden"
                                                            onChange={e => { handleVariantImageAdd(gi, e.target.files); e.target.value = ""; }} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Sizes for this color */}
                                            <div>
                                                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 px-1">
                                                    <span>Size</span><span>SKU</span><span>Stock</span>
                                                </div>
                                                <div className="space-y-1.5 mt-1">
                                                    {group.sizes.map((s, si) => (
                                                        <div key={si} className="grid grid-cols-3 gap-2 items-center">
                                                            <input value={s.size} onChange={e => updateSizeField(gi, si, "size", e.target.value)}
                                                                placeholder="M" className={`${inputSm} bg-white`} />
                                                            <input value={s.sku} onChange={e => updateSizeField(gi, si, "sku", e.target.value)}
                                                                placeholder="SKU-RED-M" required className={`${inputSm} font-mono bg-white`} />
                                                            <div className="flex gap-1.5">
                                                                <input type="number" value={s.stock} onChange={e => updateSizeField(gi, si, "stock", e.target.value)}
                                                                    placeholder="0" min="0" className={`${inputSm} bg-white`} />
                                                                {group.sizes.length > 1 && (
                                                                    <button type="button" onClick={() => removeSizeRow(gi, si)}
                                                                        className="text-gray-300 hover:text-red-400 shrink-0">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button type="button" onClick={() => addSizeRow(gi)}
                                                    className="text-xs text-slate-600 border border-dashed border-gray-300 rounded-lg px-3 py-1.5 hover:bg-white w-full mt-1.5">
                                                    + Add Size
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                <button type="button" onClick={addColorGroup}
                                    className="text-xs text-slate-700 border border-dashed border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 w-full font-medium">
                                    + Add Color Variant
                                </button>
                            </div>
                        )}
                    </Section>

                    <Section title="Tags & SEO">
                        <Field label="Tags" hint="Comma separated">
                            <input type="text" name="tags" value={form.tags} onChange={handleChange}
                                placeholder="cotton, summer, casual" className={input} />
                        </Field>
                        <Field label="SEO Title">
                            <input type="text" name="seoTitle" value={form.seoTitle} onChange={handleChange} className={input} />
                        </Field>
                        <Field label="SEO Description">
                            <JoditInput
                                height={180}
                                value={form.seoDescription}
                                onChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        seoDescription: value,
                                    }))
                                }
                            />
                        </Field>
                    </Section>
                </div>

                {/* ── RIGHT COLUMN ───────────────────────────────────────── */}
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
                            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-slate-700" />
                            <span className="text-sm text-gray-700">Featured product</span>
                        </label>
                    </Section>

                    {/* Main Image */}
                    <Section title={<>Main Image {!isEdit && <span className="text-red-500">*</span>}</>}>
                        <p className="text-xs text-gray-400 -mt-1 mb-2">Primary photo · 800×800px</p>
                        {!hasMainImage ? (
                            <div onClick={() => mainRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center cursor-pointer hover:border-slate-400 hover:bg-gray-50 transition-colors">
                                <ImgIcon />
                                <p className="text-xs text-slate-600 font-medium">Click to upload</p>
                                <p className="text-xs text-gray-300 mt-0.5">PNG, JPG, WEBP</p>
                            </div>
                        ) : (
                            <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                                <img src={mainDisplaySrc} alt="Main" className="w-full h-40 object-cover" />
                                {/* Badge: shows whether it's the saved image or a new pick */}
                                {existingMainImage && !mainPreview && (
                                    <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">Saved</span>
                                )}
                                {mainPreview && (
                                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">New</span>
                                )}
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

                    {/* Gallery - only relevant when the product has no color variants,
                        since variant photos are managed per-color in the Variants section */}
                    {!form.hasVariants && (
                        <Section title="Gallery Images">
                            <p className="text-xs text-gray-400 -mt-1 mb-2">Featured & extra photos · 1200×630px</p>

                            {totalGalleryCount > 0 && (
                                <div className="grid grid-cols-3 gap-1.5 mb-2">
                                    {/* Existing (server) gallery images */}
                                    {existingGallery.map((url, i) => (
                                        <div key={`existing-${i}`}
                                            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                            <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeExistingGalleryItem(url)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
                                            {i === 0 && existingGallery.length > 0 && (
                                                <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">Cover</span>
                                            )}
                                        </div>
                                    ))}

                                    {/* Newly picked gallery images */}
                                    {gallery.map((g, i) => (
                                        <div key={`new-${i}`}
                                            className="relative group aspect-square rounded-lg overflow-hidden border border-blue-200 bg-gray-100">
                                            <img src={g.preview} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                                            <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded leading-tight">New</span>
                                            <button type="button" onClick={() => removeGalleryItem(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
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

                            {totalGalleryCount === 0 && (
                                <div onClick={() => galleryRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center cursor-pointer hover:border-slate-400 hover:bg-gray-50 transition-colors">
                                    <ImgIcon />
                                    <p className="text-xs text-slate-600 font-medium">Click to upload</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Select multiple files</p>
                                    <p className="text-xs text-gray-300 mt-0.5">PNG, JPG, WEBP</p>
                                </div>
                            )}

                            <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGalleryAdd} className="hidden" />

                            {totalGalleryCount > 0 && (
                                <p className="text-xs text-gray-400 text-center">
                                    {totalGalleryCount} image{totalGalleryCount > 1 ? "s" : ""}
                                    {gallery.length > 0 && ` · ${gallery.length} new`}
                                </p>
                            )}
                        </Section>
                    )}

                </div>
            </div>
        </form>
    );
}

// ── Style constants ────────────────────────────────────────────────────────────
const input = "w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300 bg-white";
const inputSm = "w-full text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300";

// ── Sub-components (unchanged) ─────────────────────────────────────────────────
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586A2 2 0 0111 11h2a2 2 0 011.414.586L19 16M14 8a2 2 0 11-4 0 2 2 0 014 0zM5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
    );
}