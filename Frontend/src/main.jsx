import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {BrowserRouter} from 'react-router-dom';
import {SocketProvider} from './context/SocketProvider.jsx';
import {Socket} from '../node_modules/engine.io-client/build/esm-debug/socket';
createRoot (document.getElementById ('root')).render (
  <StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <App />
      </SocketProvider>
    </BrowserRouter>
  </StrictMode>
);
