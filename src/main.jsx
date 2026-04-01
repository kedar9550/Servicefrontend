import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
//import 'mdb-react-ui-kit/dist/css/mdb.min.css';


createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <AuthProvider>
      <SocketProvider>
         <App />
      </SocketProvider>
    </AuthProvider>
  </ThemeProvider>
)
