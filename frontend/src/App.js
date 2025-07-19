import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import BarberDashboard from './pages/BarberDashboard';
import BarberProfile from './pages/BarberProfile';
import BarberProfileForm from './pages/BarberProfileForm';
import Services from './pages/Services';
import Customers from './pages/Customers';
import BookAppointment from './pages/BookAppointment';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/barber/:id" element={<BarberProfile />} />
              
              {/* Auto-redirect to appropriate dashboard */}
              <Route path="/dashboard-redirect" element={
                <PrivateRoute>
                  <RoleBasedRedirect />
                </PrivateRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <CustomerDashboard />
                </PrivateRoute>
              } />
              <Route path="/barber-dashboard" element={
                <PrivateRoute>
                  <BarberDashboard />
                </PrivateRoute>
              } />
              <Route path="/barber-profile" element={
                <PrivateRoute>
                  <BarberProfileForm />
                </PrivateRoute>
              } />
              <Route path="/services" element={
                <PrivateRoute>
                  <Services />
                </PrivateRoute>
              } />
              <Route path="/customers" element={
                <PrivateRoute>
                  <Customers />
                </PrivateRoute>
              } />
              <Route path="/book/:barberId" element={
                <PrivateRoute>
                  <BookAppointment />
                </PrivateRoute>
              } />
              <Route path="/appointments" element={
                <PrivateRoute>
                  <Appointments />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 