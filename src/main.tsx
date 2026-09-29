import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/shared/i18n/i18n';
import '@/shared/ui/styles/globals.css';
import { App } from '@/shell/app';

const container = document.getElementById('root');
if (!container) throw new Error('index.html must contain <div id="root">');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
