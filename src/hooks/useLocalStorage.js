import { useCallback, useEffect, useState } from "react";
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch {
            return initialValue;
        }
    });
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        }
        catch {
            /* ignore quota errors */
        }
    }, [key, storedValue]);
    const updateValue = useCallback((value) => {
        setStoredValue((prev) => {
            const nextValue = value instanceof Function ? value(prev) : value;
            return nextValue;
        });
    }, [setStoredValue]);
    return [storedValue, updateValue];
}
