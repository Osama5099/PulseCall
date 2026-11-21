import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import LobbyPage from "./pages/LobbyPage.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import { getStoredUser } from "./utils/auth.js";

/**
 * App router. Login is public; lobby and call pages require name/email in localStorage.
 */
function RequireUser({ children }) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/room"
        element={
          <RequireUser>
            <LobbyPage />
          </RequireUser>
        }
      />
      <Route
        path="/room/:roomId"
        element={
          <RequireUser>
            <RoomPage />
          </RequireUser>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
