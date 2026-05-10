import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import CriarConta from "./pages/CriarConta";
import DashboardSettings from "./pages/dahsboard"; // <-- Importe o Dashboard aqui

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/criar-conta" element={<CriarConta />} />
        <Route path="/configuracoes" element={<DashboardSettings />} /> {/* <-- Adicione a nova rota aqui */}
      </Routes>
    </Router>
  );
}