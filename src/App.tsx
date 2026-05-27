import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // <-- 1. Importação do Toaster

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import CriarConta from "./pages/CriarConta";
import DashboardSettings from "./pages/dahsboard"; 
import ConectarPage from "./pages/ConectarPage";
import DashboardProfissional from "./pages/DashboardProfissional";
import DashboardAdmin from "./pages/DashboardAdmin";

export default function App() {
  return (
    <Router>
      {/* 2. Configuração global dos Toasts em Dark Mode */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: "#101C2C",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e", // Verde esmeralda do seu projeto
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444", // Vermelho do seu projeto
              secondary: "#fff",
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/criar-conta" element={<CriarConta />} />
        <Route path="/configuracoes" element={<DashboardSettings />} /> 
        <Route path="/conectar" element={<ConectarPage />} />
        <Route path="/dashboard-profissional" element={<DashboardProfissional />} />
        <Route path="/admin" element={<DashboardAdmin />} />
      </Routes>
    </Router>
  );
}