import { useEffect, useState } from 'react';

export type ColorMode = 'light' | 'dark';

const query = window.matchMedia('(prefers-color-scheme: dark)');

function current(): ColorMode {
    return query.matches ? 'dark' : 'light';
}

export function useColorMode() {
    const [colorMode, setColorMode] = useState<ColorMode>(current);
    useEffect(() => {
        const onChange = () => setColorMode(current());
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);
    useEffect(() => {
        document.documentElement.dataset.theme = colorMode;
    }, [colorMode]);
    return { colorMode };
}
