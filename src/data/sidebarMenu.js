import { FaHome, FaUsers, FaBoxOpen, FaShoppingCart, FaCog } from "react-icons/fa";

export const sidebarMenu = [
    { label: "Dashboard", path: "/", icon: FaHome },
    { label: "Users", path: "/users", icon: FaUsers },
    { label: "Category", path: "/category", icon: FaBoxOpen },
    { label: "Products", path: "/product-list", icon: FaBoxOpen },
    { label: "Orders", path: "/orders", icon: FaShoppingCart },
    { label: "Settings", path: "/settings", icon: FaCog },
];