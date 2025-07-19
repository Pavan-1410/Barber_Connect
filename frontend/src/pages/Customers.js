import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    returning: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments?limit=100');
      const appointments = response.data.appointments;
      
      // Get unique customers with their appointment history
      const customerMap = new Map();
      
      appointments.forEach(appointment => {
        const customerId = appointment.customerId._id;
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            ...appointment.customerId,
            appointments: [],
            totalSpent: 0,
            lastVisit: null,
            firstVisit: null
          });
        }
        
        const customer = customerMap.get(customerId);
        customer.appointments.push(appointment);
        customer.totalSpent += appointment.totalAmount;
        
        const appointmentDate = new Date(appointment.appointmentDate);
        if (!customer.lastVisit || appointmentDate > new Date(customer.lastVisit)) {
          customer.lastVisit = appointmentDate;
        }
        if (!customer.firstVisit || appointmentDate < new Date(customer.firstVisit)) {
          customer.firstVisit = appointmentDate;
        }
      });
      
      const customersList = Array.from(customerMap.values());
      
      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      const newCustomers = customersList.filter(customer => 
        new Date(customer.firstVisit) >= thirtyDaysAgo
      );
      
      const returningCustomers = customersList.filter(customer => 
        customer.appointments.length > 1
      );
      
      setStats({
        total: customersList.length,
        new: newCustomers.length,
        returning: returningCustomers.length
      });
      
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getDaysSinceLastVisit = (lastVisit) => {
    const now = new Date();
    const lastVisitDate = new Date(lastVisit);
    const diffTime = Math.abs(now - lastVisitDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-2">Customer Profiles</h1>
        <p className="text-secondary-600">View profiles of customers who have visited your shop</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FaUser className="text-primary-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-secondary-800">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaStar className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">New (30 days)</p>
              <p className="text-2xl font-bold text-secondary-800">{stats.new}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-secondary-600 text-sm">Returning</p>
              <p className="text-2xl font-bold text-secondary-800">{stats.returning}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-secondary-800 mb-6">Customer List</h2>
        
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-600 mb-4">No customers found</p>
            <p className="text-secondary-500 text-sm">Customers will appear here once they book appointments with you</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Appointments</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Total Spent</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Last Visit</th>
                  <th className="text-left py-3 px-4 font-semibold text-secondary-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-800">
                          {customer.name}
                        </p>
                        <p className="text-sm text-secondary-600">
                          Customer since {formatDate(customer.firstVisit)}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-secondary-600">
                          <FaEnvelope className="mr-2 text-xs" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-sm text-secondary-600">
                            <FaPhone className="mr-2 text-xs" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-800">
                          {customer.appointments.length} appointment{customer.appointments.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {customer.appointments.filter(apt => apt.status === 'completed').length} completed
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-secondary-800">
                        {formatCurrency(customer.totalSpent)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-secondary-800">{formatDate(customer.lastVisit)}</p>
                        <p className="text-sm text-secondary-600">
                          {getDaysSinceLastVisit(customer.lastVisit)} days ago
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {customer.appointments.length === 1 ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          New Customer
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Returning
                        </span>
                      )}
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

export default Customers; 