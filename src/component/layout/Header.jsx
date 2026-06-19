import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { logout } = useAuth();

  const user = JSON.parse(
    localStorage.getItem("user_data")
  );

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="font-bold text-xl">
          Welcome, {user?.username}
        </h2>
      </div>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </header>
  );
}