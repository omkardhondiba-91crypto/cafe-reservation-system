import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Loading Café Reserve...</h2>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }
return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
