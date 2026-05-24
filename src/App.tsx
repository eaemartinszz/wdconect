import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import CriarConta from "./pages/CriarConta";
import DashboardSettings from "./pages/dahsboard"; 
import ConectarPage from "./pages/ConectarPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/criar-conta" element={<CriarConta />} />
        <Route path="/" element={<DashboardSettings />} /> {/* <-- Adicione a nova rota aqui */}
        <Route path="/conectar" element={<ConectarPage />} />
      </Routes>
    </Router>
  );
}