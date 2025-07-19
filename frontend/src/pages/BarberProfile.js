import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaMapMarkerAlt, FaClock, FaPhone, FaEnvelope, FaCalendar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BarberProfile = () => {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarberProfile();
  }, [id]);

  const fetchBarberProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/barbers/${id}`);
      setBarber(response.data);
    } catch (error) {
      console.error('Error fetching barber profile:', error);
      toast.error('Failed to load barber profile');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    return time || 'Not specified';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-800 mb-4">Barber Not Found</h1>
          <p className="text-secondary-600 mb-6">The barber profile you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{barber.shopName}</h1>
            <p className="text-xl text-primary-100 mb-4">{barber.userId?.name}</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-2" />
                <span className="font-semibold">{barber.rating}</span>
                <span className="ml-1">({barber.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                <span>{barber.location.city}, {barber.location.state}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              to={`/book/${barber.userId._id}`}
              className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-secondary-800 mb-4">About</h2>
            {barber.description ? (
              <p className="text-secondary-600 leading-relaxed">{barber.description}</p>
            ) : (
              <p className="text-secondary-500 italic">No description available.</p>
            )}
          </div>

          {/* Services Section */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-secondary-800 mb-6">Services & Pricing</h2>
            {barber.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barber.services.map((service, index) => (
                  <div key={index} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-secondary-800">{service.name}</h3>
                      <span className="font-bold text-primary-600">₹{service.price}</span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-secondary-600 mb-2">{service.description}</p>
                    )}
                    <div className="flex items-center text-sm text-secondary-500">
                      <FaClock className="mr-1" />
                      <span>{service.duration} minutes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500 italic">No services available.</p>
            )}
          </div>

          {/* Working Hours */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-secondary-800 mb-6">Working Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(barber.workingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                  <span className="font-medium text-secondary-800 capitalize">{day}</span>
                  <span className="text-secondary-600">
                    {hours.isOpen ? `${formatTime(hours.open)} - ${formatTime(hours.close)}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-secondary-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center text-secondary-600">
                <FaEnvelope className="mr-3 text-primary-600" />
                <span>{barber.userId?.email}</span>
              </div>
              {barber.userId?.phone && (
                <div className="flex items-center text-secondary-600">
                  <FaPhone className="mr-3 text-primary-600" />
                  <span>{barber.userId.phone}</span>
                </div>
              )}
              <div className="flex items-start text-secondary-600">
                <FaMapMarkerAlt className="mr-3 mt-1 text-primary-600" />
                <div>
                  <p>{barber.location.address}</p>
                  <p>{barber.location.city}, {barber.location.state} {barber.location.zipCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-secondary-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Experience:</span>
                <span className="font-medium text-secondary-800">{barber.experience} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Services:</span>
                <span className="font-medium text-secondary-800">{barber.services.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Rating:</span>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-medium text-secondary-800">{barber.rating}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Reviews:</span>
                <span className="font-medium text-secondary-800">{barber.totalReviews}</span>
              </div>
            </div>
          </div>

          {/* Specialties */}
          {barber.specialties && barber.specialties.length > 0 && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-secondary-800 mb-4">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {barber.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Book Appointment CTA */}
          <div className="card p-6 bg-primary-50 border-primary-200">
            <h3 className="text-xl font-bold text-primary-800 mb-4">Ready to Book?</h3>
            <p className="text-primary-700 mb-4">
              Schedule your appointment with {barber.userId?.name} today!
            </p>
            <Link
              to={`/book/${barber.userId._id}`}
              className="btn-primary w-full text-center"
            >
              <FaCalendar className="mr-2" />
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberProfile; 