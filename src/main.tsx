import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import App from './App.tsx';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SERVER_URL || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
