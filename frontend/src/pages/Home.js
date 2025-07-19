import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaStar, FaMapMarkerAlt, FaSearch, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    rating: '',
    service: ''
  });

  useEffect(() => {
    fetchBarbers();
  }, [filters]);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            BarberConnect
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Connect with skilled barbers in your area and book appointments instantly
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/profile"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                My Profile
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
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
        </div>
      </section>

      {/* Barbers Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-secondary-800 mb-8 text-center">
            Shops Nearby
          </h2>

          {loading ? (
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
              {barbers.map((barber) => (
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
                    {isAuthenticated ? (
                      <Link
                        to={`/book/${barber.userId._id}`}
                        className="btn-primary flex-1 text-center"
                      >
                        Book Now
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="btn-primary flex-1 text-center"
                      >
                        Sign In to Book
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 