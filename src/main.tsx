import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/special-elite/latin-400.css';
import '@fontsource/caveat/latin-500.css';
import { App } from './app/App';
import './styles/globals.css';
import './styles/utilities.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
