import React, { createContext, useContext, useState } from 'react';

interface GenreContextType {
    selectedGenreId: string | null;
    selectedGenreName: string | null;
    setSelectedGenre: (genreId: string | null, genreName: string | null) => void;
}

const GenreContext = createContext<GenreContextType | undefined>(undefined);

export const GenreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
    const [selectedGenreName, setSelectedGenreName] = useState<string | null>(null);

    const setSelectedGenre = (genreId: string | null, genreName: string | null) => {
        setSelectedGenreId(genreId);
        setSelectedGenreName(genreName);
    };

    return (
        <GenreContext.Provider value={{ selectedGenreId, selectedGenreName, setSelectedGenre }}>
            {children}
        </GenreContext.Provider>
    );
};

export const useGenre = () => {
    const context = useContext(GenreContext);
    if (!context) {
        throw new Error('useGenre must be used within GenreProvider');
    }
    return context;
};
