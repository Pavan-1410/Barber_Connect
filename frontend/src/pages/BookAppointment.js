import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendar, FaClock, FaStar, FaCreditCard, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { barberId } = useParams();
  const navigate = useNavigate();
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    services: [],
    notes: ''
  });

  useEffect(() => {
    fetchBarberData();
  }, [barberId]);

  const fetchBarberData = async () => {
    try {
      setLoading(true);
      // Get barber profile by user ID
      const response = await axios.get(`/api/barbers?userId=${barberId}`);
      if (response.data.barbers.length > 0) {
        setBarber(response.data.barbers[0]);
      } else {
        toast.error('Barber not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching barber:', error);
      toast.error('Failed to load barber information');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.find(s => s.name === service.name)
        ? prev.services.filter(s => s.name !== service.name)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Please select date and time');
      return;
    }

    if (formData.services.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setBookingLoading(true);
    try {
      // Create appointment
      const appointmentResponse = await axios.post('/api/appointments', {
        barberId: barber.userId._id,
        barberProfileId: barber._id,
        services: formData.services,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        notes: formData.notes
      });

      const appointment = appointmentResponse.data;

      // Simulate payment process
      toast.success('Appointment created! Processing payment...');
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      await axios.post('/api/payments/simulate', {
        appointmentId: appointment._id
      });

      toast.success('Payment successful! Appointment confirmed.');
      navigate('/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      const message = error.response?.data?.message || 'Failed to book appointment';
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.services.reduce((total, service) => total + service.price, 0);
  };

  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 9; hour <= 18; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-800 mb-4">Barber Not Found</h1>
          <p className="text-secondary-600">The barber you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-8">Book Appointment</h1>
        
        {/* Barber Info */}
        <div className="bg-secondary-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-secondary-800 mb-2">
                {barber.shopName}
              </h2>
              <p className="text-secondary-600 mb-2">{barber.userId?.name}</p>
              <div className="flex items-center text-sm text-secondary-500">
                <FaStar className="text-yellow-400 mr-1" />
                <span>{barber.rating} ({barber.totalReviews} reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-secondary-600">Location</p>
              <p className="font-medium text-secondary-800">
                {barber.location.city}, {barber.location.state}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Services Selection */}
          <div>
            <h3 className="text-xl font-semibold text-secondary-800 mb-4">Select Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barber.services.map((service, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                    formData.services.find(s => s.name === service.name)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                  onClick={() => handleServiceToggle(service)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-secondary-800">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-secondary-600 mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center text-sm text-secondary-500 mt-2">
                        <FaClock className="mr-1" />
                        <span>{service.duration} minutes</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">₹{service.price}</p>
                      {formData.services.find(s => s.name === service.name) && (
                        <FaCheck className="text-primary-600 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Appointment Date
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Appointment Time
              </label>
              <select
                value={formData.appointmentTime}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Select time</option>
                {getAvailableTimes().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="input-field"
              placeholder="Any special requests or notes for the barber..."
            />
          </div>

          {/* Summary */}
          <div className="bg-secondary-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-secondary-800 mb-4">Booking Summary</h3>
            <div className="space-y-3">
              {formData.services.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-secondary-600">{service.name}</span>
                  <span className="font-medium">₹{service.price}</span>
                </div>
              ))}
              <hr className="border-secondary-200" />
              <div className="flex justify-between text-lg font-bold text-secondary-800">
                <span>Total Amount</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
          </div>

          {/* Payment Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FaCreditCard className="text-blue-600 mt-1 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Payment Information</h4>
                <p className="text-blue-700 text-sm">
                  This is a demo application. Payment will be simulated and marked as successful automatically.
                  In a real application, you would be redirected to a payment gateway.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={bookingLoading}
              className="btn-primary inline-flex items-center text-lg px-8 py-3"
            >
              {bookingLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaCreditCard className="mr-2" />
                  Book Appointment & Pay
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment; 