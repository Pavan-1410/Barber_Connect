import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaStar, FaSearch, FaPlus, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barbersLoading, setBarbersLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    rating: '',
    service: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchBarbers();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments?limit=5');
      setRecentAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarbers = async () => {
    try {
      setBarbersLoading(true);
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.service) params.append('service', filters.service);

      const response = await axios.get(`/api/barbers?${params}`);
      setBarbers(response.data.barbers);
    } catch (error) {
      console.error('Error fetching barbers:', error);
      toast.error('Failed to load barbers');
    } finally {
      setBarbersLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      rating: '',
      service: ''
    });
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

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100">
          Discover great barbers and book your next appointment.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-secondary-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              <FaSearch className="text-primary-600 mr-3" />
              <span className="text-primary-700 font-medium">Find More Barbers</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
            >
              <FaStar className="text-secondary-600 mr-3" />
              <span className="text-secondary-700 font-medium">Update Profile</span>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-secondary-800 mb-4">Recent Activity</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-600 mb-4">No appointments yet</p>
              <Link
                to="/"
                className="btn-primary inline-flex items-center"
              >
                <FaPlus className="mr-2" />
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment._id} className="border-b border-secondary-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-secondary-800">
                        {appointment.barberProfileId?.shopName}
                      </h4>
                      <p className="text-sm text-secondary-600">
                        {appointment.barberId?.name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-500 mb-2">
                    <FaCalendar className="mr-1" />
                    {formatDate(appointment.appointmentDate)}
                    <FaClock className="ml-3 mr-1" />
                    {appointment.appointmentTime}
                  </div>
                  <div className="flex items-center text-sm text-secondary-500">
                    <FaMapMarkerAlt className="mr-1" />
                    {appointment.barberProfileId?.location?.city}, {appointment.barberProfileId?.location?.state}
                  </div>
                </div>
              ))}
              
              {/* Book Appointment Button */}
              <div className="pt-4 border-t border-secondary-200">
                <Link
                  to="/"
                  className="btn-primary w-full inline-flex items-center justify-center"
                >
                  <FaPlus className="mr-2" />
                  Book New Appointment
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discover Barbers Section */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-secondary-800">Discover Barbers</h3>
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-primary-600" />
            <span className="font-semibold text-secondary-700">Filters:</span>
          </div>
          
          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="input-field max-w-xs"
          />
          
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
          
          <input
            type="text"
            placeholder="Service (e.g., haircut, shave)"
            value={filters.service}
            onChange={(e) => handleFilterChange('service', e.target.value)}
            className="input-field max-w-xs"
          />
          
          <button
            onClick={clearFilters}
            className="btn-outline"
          >
            Clear Filters
          </button>
        </div>

        {/* Barbers Grid */}
        {barbersLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : barbers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-600 text-lg">No barbers found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="btn-primary mt-4"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.slice(0, 6).map((barber) => (
              <div key={barber._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-800 mb-1">
                      {barber.shopName}
                    </h3>
                    <p className="text-secondary-600 mb-2">
                      {barber.userId?.name}
                    </p>
                    <div className="flex items-center text-sm text-secondary-500 mb-2">
                      <FaMapMarkerAlt className="mr-1" />
                      {barber.location.city}, {barber.location.state}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{barber.rating}</span>
                    <span className="text-secondary-500">({barber.totalReviews})</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-secondary-700 mb-2">Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {barber.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm"
                      >
                        {service.name} - ₹{service.price}
                      </span>
                    ))}
                    {barber.services.length > 3 && (
                      <span className="text-secondary-500 text-sm">
                        +{barber.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/barber/${barber._id}`}
                    className="btn-outline flex-1 text-center"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/book/${barber.userId._id}`}
                    className="btn-primary flex-1 text-center"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard; 