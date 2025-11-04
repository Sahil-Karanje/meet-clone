import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
