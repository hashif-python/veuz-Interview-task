import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import Dashboard from './components/dashboard/Dashboard';
import FormBuilder from './components/forms/FormBuilder';
import EmployeeList from './components/employees/EmployeeList';
import EmployeeForm from './components/employees/EmployeeForm';

const PublicRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const { user, authReady } = useAuth();
  const location = useLocation();

  // Wait for auth restoration before deciding where to go
  if (!authReady) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already logged in, go to intended page or dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  return user ? <Navigate to={from} replace /> : element;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes (wait for authReady inside PublicRoute) */}
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/register" element={<PublicRoute element={<Register />} />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="forms" element={<FormBuilder />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/create" element={<EmployeeForm />} />
          <Route path="employees/edit/:id" element={<EmployeeForm />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
