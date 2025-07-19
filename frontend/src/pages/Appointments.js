import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaStar, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments?limit=100');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await axios.put(`/api/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
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

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-secondary-800 mb-4 md:mb-0">
            My Appointments
          </h1>
          
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="all">All Appointments</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-600 text-lg mb-4">
              {filter === 'all' ? 'No appointments found' : `No ${filter} appointments found`}
            </p>
            {filter === 'all' && (
              <p className="text-secondary-500">
                Start by booking an appointment with a barber.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-secondary-800 mb-1">
                          {user?.role === 'customer' 
                            ? appointment.barberProfileId?.shopName 
                            : appointment.customerId?.name
                          }
                        </h3>
                        <p className="text-secondary-600">
                          {user?.role === 'customer' 
                            ? appointment.barberId?.name 
                            : appointment.customerId?.email
                          }
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-secondary-600">
                        <FaCalendar className="mr-2" />
                        <span>{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <FaClock className="mr-2" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>
                          {appointment.barberProfileId?.location?.city}, {appointment.barberProfileId?.location?.state}
                        </span>
                      </div>
                      <div className="flex items-center text-secondary-600">
                        <FaStar className="mr-2" />
                        <span>₹{appointment.totalAmount}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-secondary-700 mb-2">Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {appointment.services.map((service, index) => (
                          <span
                            key={index}
                            className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                          >
                            {service.name} - ₹{service.price}
                          </span>
                        ))}
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-secondary-700 mb-2">Notes:</h4>
                        <p className="text-secondary-600 bg-secondary-50 p-3 rounded-lg">
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {appointment.cancellationReason && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-red-700 mb-2">Cancellation Reason:</h4>
                        <p className="text-red-600 bg-red-50 p-3 rounded-lg">
                          {appointment.cancellationReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:ml-6 lg:flex-shrink-0">
                    {user?.role === 'customer' && 
                     ['pending', 'approved'].includes(appointment.status) && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white inline-flex items-center"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments; 