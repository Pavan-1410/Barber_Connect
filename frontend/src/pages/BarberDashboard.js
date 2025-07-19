import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaCalendar, FaClock, FaUser, FaStar, FaEdit, FaPlus, FaCheck, FaTimes, FaDollarSign, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BarberDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [barberProfile, setBarberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    earnings: 0,
    customers: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments for this barber
      const appointmentsResponse = await axios.get('/api/appointments?limit=10');
      setAppointments(appointmentsResponse.data.appointments);
      
      // Fetch barber profile
      try {
        const profileResponse = await axios.get('/api/barbers/profile/me');
        setBarberProfile(profileResponse.data);
      } catch (error) {
        // Profile doesn't exist yet
        setBarberProfile(null);
      }
      
      // Calculate stats
      const allAppointments = await axios.get('/api/appointments?limit=100');
      const allApts = allAppointments.data.appointments;
      
      // Calculate earnings from completed appointments
      const earnings = allApts
        .filter(apt => apt.status === 'completed' && apt.paymentStatus === 'paid')
        .reduce((total, apt) => total + apt.totalAmount, 0);
      
      // Get unique customers
      const uniqueCustomers = new Set(allApts.map(apt => apt.customerId._id));
      
      setStats({
        total: allApts.length,
        pending: allApts.filter(apt => apt.status === 'pending').length,
        approved: allApts.filter(apt => apt.status === 'approved').length,
        completed: allApts.filter(apt => apt.status === 'completed').length,
        earnings: earnings,
        customers: uniqueCustomers.size
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100">
          Manage your appointments and grow your business.
        </p>
        {!barberProfile && (
          <div className="mt-4">
                          <Link
                to="/barber-profile"
                className="bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium inline-flex items-center"
              >
                <FaPlus className="mr-2" />
                Create Your Profile
              </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FaCalendar className="text-primary-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-secondary-800">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-secondary-800">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaCheck className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-secondary-800">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaStar className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-secondary-800">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaDollarSign className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">Total Earnings</p>
              <p className="text-lg font-bold text-secondary-800">{formatCurrency(stats.earnings)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FaUsers className="text-indigo-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">Customers</p>
              <p className="text-2xl font-bold text-secondary-800">{stats.customers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-secondary-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/barber-profile"
              className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              <FaEdit className="text-primary-600 mr-3" />
              <span className="text-primary-700 font-medium">
                {barberProfile ? 'Update Profile' : 'Create Profile'}
              </span>
            </Link>
            <Link
              to="/appointments"
              className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
            >
              <FaCalendar className="text-secondary-600 mr-3" />
              <span className="text-secondary-700 font-medium">Manage Appointments</span>
            </Link>
            <Link
              to="/customers"
              className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
            >
              <FaUsers className="text-secondary-600 mr-3" />
              <span className="text-secondary-700 font-medium">Customer Profiles</span>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-secondary-800 mb-4">Business Overview</h3>
          {barberProfile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Shop Name:</span>
                <span className="font-medium text-secondary-800">{barberProfile.shopName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Location:</span>
                <span className="font-medium text-secondary-800">
                  {barberProfile.location.city}, {barberProfile.location.state}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Rating:</span>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-medium text-secondary-800">{barberProfile.rating}</span>
                  <span className="text-secondary-500 ml-1">({barberProfile.totalReviews})</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Services:</span>
                <span className="font-medium text-secondary-800">{barberProfile.services.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Monthly Earnings:</span>
                <span className="font-medium text-secondary-800">{formatCurrency(stats.earnings)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-secondary-600 mb-4">No profile created yet</p>
              <Link
                to="/barber-profile"
                className="btn-primary inline-flex items-center"
              >
                <FaPlus className="mr-2" />
                Create Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-secondary-800">Recent Appointments</h3>
          <Link
            to="/appointments"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-secondary-600 mb-4">No appointments found</p>
            <p className="text-secondary-500 text-sm">Appointments will appear here when customers book with you</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Services</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-800">
                          {appointment.customerId?.name}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {appointment.customerId?.email}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {appointment.customerId?.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-secondary-800">{formatDate(appointment.appointmentDate)}</p>
                        <p className="text-sm text-secondary-600">{appointment.appointmentTime}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {appointment.services.map((service, index) => (
                          <span
                            key={index}
                            className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs"
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-secondary-800">
                        {formatCurrency(appointment.totalAmount)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'approved')}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium"
                            >
                              <FaCheck className="inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                            >
                              <FaTimes className="inline mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        {appointment.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                          >
                            <FaCheck className="inline mr-1" />
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarberDashboard; 