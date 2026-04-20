import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
    searchKeyword: string | null;
    setSearchKeyword: (keyword: string | null) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchKeyword, setSearchKeyword] = useState<string | null>(null);

    return (
        <SearchContext.Provider value={{ searchKeyword, setSearchKeyword }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within SearchProvider');
    }
    return context;
};
