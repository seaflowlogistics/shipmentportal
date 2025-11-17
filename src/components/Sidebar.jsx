import { NavLink } from "react-router-dom";

const linkStyles =
  "block px-4 py-2 rounded-lg text-sm font-medium transition-all";
const activeStyles = "bg-blue-600 text-white shadow";
const inactiveStyles = "text-gray-700 hover:bg-gray-100";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="px-6 py-6 border-b">
        <h1 className="text-xl font-bold">Seaflow Logistics</h1>
        <p className="text-xs text-gray-500 mt-1">Shipment Portal</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkStyles} ${isActive ? activeStyles : inactiveStyles}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/registration"
          className={({ isActive }) =>
            `${linkStyles} ${isActive ? activeStyles : inactiveStyles}`
          }
        >
          Registration
        </NavLink>

        <NavLink
          to="/clearance"
          className={({ isActive }) =>
            `${linkStyles} ${isActive ? activeStyles : inactiveStyles}`
          }
        >
          Clearance
        </NavLink>

        <NavLink
          to="/accounts"
          className={({ isActive }) =>
            `${linkStyles} ${isActive ? activeStyles : inactiveStyles}`
          }
        >
          Accounts
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${linkStyles} ${isActive ? activeStyles : inactiveStyles}`
          }
        >
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
