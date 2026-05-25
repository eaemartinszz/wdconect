import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import CriarConta from "./pages/CriarConta";
import DashboardSettings from "./pages/dahsboard"; 
import ConectarPage from "./pages/ConectarPage";
import DashboardProfissional from "./pages/DashboardProfissional"; // <-- Adicionada a importação do dashboard do profissional

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/criar-conta" element={<CriarConta />} />
        <Route path="/configuracoes" element={<DashboardSettings />} /> 
        <Route path="/conectar" element={<ConectarPage />} />
        <Route path="/dashboard-profissional" element={<DashboardProfissional />} /> {/* <-- Adicionada a nova rota aqui */}
      </Routes>
    </Router>
  );
}