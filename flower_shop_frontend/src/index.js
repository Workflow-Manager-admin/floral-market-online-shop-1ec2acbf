import React from 'react';
import ReactDOM from 'react-dom/client';
// Import both global CSS files so all base and brand styles apply app-wide.
import './index.css';
import './App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
