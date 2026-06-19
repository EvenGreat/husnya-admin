import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 flex flex-col min-h-screen">
                <Header />

                <main className="flex-1 p-6 bg-gray-100">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}