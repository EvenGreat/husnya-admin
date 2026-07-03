import { FaHome, FaUsers, FaBoxOpen, FaShoppingCart, FaCog, FaPlus, FaList, } from "react-icons/fa";

export const sidebarMenu = [
    { label: "Dashboard", path: "/", icon: FaHome, },
    { label: "Users", path: "/users", icon: FaUsers, },
    {
        label: "Products", icon: FaBoxOpen,
        children: [
            {
                label: "Create Product",
                path: "/product-list",
                icon: FaPlus,
            },
            {
                label: "All Products",
                path: "/products",
                icon: FaList,
            },
        ],
    },
    {
        label: "Category",
        path: "/category",
        icon: FaBoxOpen,
    },
    {
        label: "Collections",
        path: "/collection",
        icon: FaBoxOpen,
    },
    {
        label: "Orders",
        path: "/orders",
        icon: FaShoppingCart,
    },
    {
        label: "Settings",
        path: "/settings",
        icon: FaCog,
    },
];