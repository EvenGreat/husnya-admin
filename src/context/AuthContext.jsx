import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("user_token")
    );
    const login = (token, user) => {
        localStorage.setItem("user_token", token);
        if (user) {
            localStorage.setItem(
                "user_data",
                JSON.stringify(user)
            );
        }
        setIsAuthenticated(true);
    };
    const logout = () => {
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_data");

        setIsAuthenticated(false);
    };
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);