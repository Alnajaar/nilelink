"use client";

import React from "react";

// Simple ThemeProvider shim until package linking is fully propagated
const ThemeContext = React.createContext({});
const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
    <ThemeContext.Provider value={{ locked: true }}>
        {children}
    </ThemeContext.Provider>
);

export { ThemeProvider };
