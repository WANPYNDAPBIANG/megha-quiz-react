import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    // 1. Checks your .env file first
    // 2. Uses your public Codespaces backend URL if .env is missing
    // 3. Falls back to localhost only if neither is available
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://bug-free-trout-p5646r5gxjp279r6-4000.app.github.dev";

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);

    const value = {
        backendUrl,
        isLoggedIn, 
        setIsLoggedIn,
        userData, 
        setUserData
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
