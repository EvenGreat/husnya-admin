import { NavLink } from "react-router-dom";
import { sidebarMenu } from "../../data/sidebarMenu";
import { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wide">
          Husnya Panel
        </h1>
      </div>

      <div className="p-4">
        <nav className="space-y-2">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;

            // Menu with children
            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>

                    {openMenus[item.label] ? (
                      <FaChevronDown size={12} />
                    ) : (
                      <FaChevronRight size={12} />
                    )}
                  </button>

                  {openMenus[item.label] && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;

                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                                isActive
                                  ? "bg-white text-slate-900 font-semibold"
                                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
                              }`
                            }
                          >
                            <ChildIcon size={14} />
                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Normal menu item
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-lg font-semibold"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`
                }
              >
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