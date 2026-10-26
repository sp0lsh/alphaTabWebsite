import React from 'react';
import { createRoot } from 'react-dom/client';
import 'infima/dist/css/default/default.css';
import '@fontsource/noto-sans';
import '@fontsource/noto-serif';
import 'react-tooltip/dist/react-tooltip.css';
import './main.scss';
import { AlphaTabPlayground } from '@site/src/components/AlphaTabPlayground';

createRoot(document.getElementById('root')!).render(
    <>
        <AlphaTabPlayground />
    </>
);
