import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Travel from './pages/Travel';
import Food from './pages/Food';
import FoodSelection from './pages/FoodSelection';
import Waste from './pages/Waste';
import WasteDetail from './pages/WasteDetail';
import Electricity from './pages/Electricity';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

function AppLayout() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {user && <BottomNav />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/travel" element={<ProtectedRoute><Travel /></ProtectedRoute>} />
        <Route path="/food" element={<ProtectedRoute><Food /></ProtectedRoute>} />
        <Route path="/food/:meal/:type" element={<ProtectedRoute><FoodSelection /></ProtectedRoute>} />
        <Route path="/waste" element={<ProtectedRoute><Waste /></ProtectedRoute>} />
        <Route path="/waste/:category" element={<ProtectedRoute><WasteDetail /></ProtectedRoute>} />
        <Route path="/electricity" element={<ProtectedRoute><Electricity /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
