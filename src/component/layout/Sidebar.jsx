import { NavLink } from "react-router-dom";
import { sidebarMenu } from "../../data/sidebarMenu";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-1xl font-bold tracking-wide">
          Husnya Panel
        </h1>
      </div>
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? "bg-white text-slate-900 shadow-lg font-semibold" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`} >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}