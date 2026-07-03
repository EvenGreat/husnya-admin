import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Home from "../pages/dashboard/Home";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../component/layout/MainLayout";
import CreateCategory from "../pages/category/CreateCategory";
import CreateProduct from "../pages/CreateProduct";
import ProductList from "../pages/ProductList";
import CreateCollection from "../pages/category/Collection";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute> <MainLayout /> </ProtectedRoute>} >
                <Route path="/" element={<Home />} />
                <Route path="/category" element={<CreateCategory />} />
                <Route path="/product-list" element={<CreateProduct />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/collection" element={<CreateCollection />} />
            </Route>
        </Routes>
    );
}