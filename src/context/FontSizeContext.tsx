import React, { createContext, useContext, useState, useEffect } from "react";

type FontSize = "small" | "normal" | "large";

interface FontSizeContextType {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    resetFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontSize, setFontSizeState] = useState<FontSize>("normal");

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("text-sm", "text-base", "text-lg");

        switch (fontSize) {
            case "small":
                root.style.fontSize = "14px";
                break;
            case "normal":
                root.style.fontSize = "16px";
                break;
            case "large":
                root.style.fontSize = "18px";
                break;
        }
    }, [fontSize]);

    const setFontSize = (size: FontSize) => setFontSizeState(size);

    const increaseFontSize = () => setFontSizeState("large");
    const decreaseFontSize = () => setFontSizeState("small");
    const resetFontSize = () => setFontSizeState("normal");

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize, increaseFontSize, decreaseFontSize, resetFontSize }}>
            {children}
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (context === undefined) {
        throw new Error("useFontSize must be used within a FontSizeProvider");
    }
    return context;
};
