import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);


    // restore login on refresh
    useEffect(() => {

        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }

        setLoading(false);

    }, []);


    const login = (userData, token) => {

        setUser({
            ...userData,
            _id: userData._id || userData.id
        });
        setToken(token);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);

    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
            }}
        >
            {children}

        </AuthContext.Provider>

    );

};