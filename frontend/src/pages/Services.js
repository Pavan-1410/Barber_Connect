import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Services = () => {
  const { user, isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barberProfile, setBarberProfile] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 30,
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('Current user:', user);
    console.log('Is authenticated:', isAuthenticated);
    fetchBarberProfile();
  }, []);

  const fetchBarberProfile = async () => {
    try {
      setLoading(true);
      console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
      const response = await axios.get('/api/barbers/profile/me');
      console.log('Barber profile response:', response.data);
      setBarberProfile(response.data);
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching barber profile:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 404) {
        toast.error('Barber profile not found. Please create a profile first.');
      } else {
        toast.error('Failed to load services');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const updatedServices = editingService 
        ? services.map(service => 
            service._id === editingService._id 
              ? { ...formData, _id: service._id }
              : service
          )
        : [...services, { 
            name: formData.name,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration),
            description: formData.description
          }];

      console.log('Sending services update:', {
        barberId: barberProfile._id,
        services: updatedServices
      });

      const response = await axios.put(`/api/barbers/${barberProfile._id}/services`, {
        services: updatedServices
      });

      console.log('Response:', response.data);

      setServices(response.data.services);
      setFormData({
        name: '',
        price: '',
        duration: 30,
        description: ''
      });
      setEditingService(null);
      setShowAddForm(false);
      
      toast.success(editingService ? 'Service updated successfully!' : 'Service added successfully!');
    } catch (error) {
      console.error('Error saving service:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const updatedServices = services.filter(service => service._id !== serviceId);
        const response = await axios.put(`/api/barbers/${barberProfile._id}/services`, {
          services: updatedServices
        });

        setServices(response.data.services);
        toast.success('Service deleted successfully!');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const cancelEdit = () => {
    setEditingService(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      price: '',
      duration: 30,
      description: ''
    });
    setErrors({});
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!barberProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-12">
          <p className="text-secondary-600 mb-4">You need to create a barber profile first</p>
          <a
            href="/barber-profile"
            className="btn-primary inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-800">Manage Services</h1>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Service
            </button>
          )}
        </div>

        {/* Add/Edit Service Form */}
        {showAddForm && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                    Service Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g., Haircut, Beard Trim"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-secondary-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="500"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-secondary-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    min="15"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`input-field ${errors.duration ? 'border-red-500' : ''}`}
                    placeholder="30"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Brief description of the service"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-secondary inline-flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center"
                >
                  <FaSave className="mr-2" />
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        <div>
          <h2 className="text-xl font-semibold text-secondary-800 mb-4">Your Services</h2>
          
          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-600 mb-4">No services added yet</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary inline-flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Your First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service._id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-secondary-800">
                      {service.name}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Price:</span>
                      <span className="font-semibold text-secondary-800">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Duration:</span>
                      <span className="text-secondary-800">{service.duration} min</span>
                    </div>
                    {service.description && (
                      <div>
                        <span className="text-secondary-600">Description:</span>
                        <p className="text-secondary-800 text-sm mt-1">{service.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services; 