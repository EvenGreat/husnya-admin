import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProduct } from "../services/authService";

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const navigate = useNavigate();

    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await fetchProduct();
            if (res.data.success) {
                setProducts(res.data.data.products);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleEdit = (productId) => {
        navigate(`/products/edit/${productId}`);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        // try {
        //     setDeletingId(productId);
        //     await deleteProduct(productId);
        //     setProducts(prev => prev.filter(p => p._id !== productId));
        // } catch (err) {
        //     console.error(err);
        //     alert(err?.response?.data?.message || "Failed to delete product");
        // } finally {
        //     setDeletingId(null);
        // }
    };

    const statusStyles = {
        active:   "bg-green-50 text-green-700 ring-1 ring-green-200",
        draft:    "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        archived: "bg-red-50 text-red-600 ring-1 ring-red-200",
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Products</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {!loading && `${products.length} product${products.length !== 1 ? "s" : ""} total`}
                    </p>
                </div>
                <Link
                    to="/products/create"
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                </Link>
            </div>

            {/* Table card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Image</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            /* Skeleton rows */
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-4 py-3">
                                        <div className="w-11 h-11 rounded-lg bg-gray-100 animate-pulse" />
                                    </td>
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                                        </td>
                                    ))}
                                    <td className="px-4 py-3">
                                        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-16 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-16 text-gray-400">
                                    <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-400">No products yet</p>
                                    <p className="text-xs text-gray-300 mt-1">Click "Add Product" to get started</p>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr
                                    key={product._id}
                                    className="hover:bg-gray-50 transition-colors group"
                                >
                                    {/* Image */}
                                    <td className="px-4 py-3">
                                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                            {product.featuredImage ? (
                                                <img
                                                    src={product.featuredImage}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586A2 2 0 0111 11h2a2 2 0 011.414.586L19 16M14 8a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Name + SKU */}
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800 leading-snug">{product.name}</p>
                                        {product.sku && (
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</p>
                                        )}
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-3 text-gray-500">
                                        {product.category?.name ?? "—"}
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-gray-800">
                                            ₹{(product.salePrice || product.regularPrice).toLocaleString("en-IN")}
                                        </span>
                                        {product.salePrice && product.regularPrice && product.salePrice < product.regularPrice && (
                                            <span className="text-xs text-gray-400 line-through ml-1.5">
                                                ₹{product.regularPrice.toLocaleString("en-IN")}
                                            </span>
                                        )}
                                    </td>

                                    {/* Stock */}
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-amber-500" : "text-gray-700"}`}>
                                            {product.stock ?? "—"}
                                        </span>
                                    </td>

                                    {/* Status badge */}
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[product.status] ?? "bg-gray-100 text-gray-500"}`}>
                                            {product.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edit button */}
                                            <button
                                                onClick={() => handleEdit(product._id)}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>

                                            {/* Delete button */}
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                disabled={deletingId === product._id}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {deletingId === product._id ? (
                                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                                {deletingId === product._id ? "Deleting…" : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}