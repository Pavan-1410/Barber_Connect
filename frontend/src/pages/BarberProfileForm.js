import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaStore, FaMapMarkerAlt, FaTools, FaClock, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BarberProfileForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [barberProfile, setBarberProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    shopName: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    services: [
      {
        name: '',
        price: '',
        duration: 30,
        description: ''
      }
    ],
    description: '',
    experience: 0,
    specialties: []
  });

  useEffect(() => {
    fetchBarberProfile();
  }, []);

  const fetchBarberProfile = async () => {
    try {
      setFetching(true);
      const response = await axios.get('/api/barbers/profile/me');
      setBarberProfile(response.data);
      setFormData({
        shopName: response.data.shopName || '',
        location: {
          address: response.data.location?.address || '',
          city: response.data.location?.city || '',
          state: response.data.location?.state || '',
          zipCode: response.data.location?.zipCode || ''
        },
        services: response.data.services?.length > 0 ? response.data.services : [
          {
            name: '',
            price: '',
            duration: 30,
            description: ''
          }
        ],
        description: response.data.description || '',
        experience: response.data.experience || 0,
        specialties: response.data.specialties || []
      });
    } catch (error) {
      console.error('Error fetching barber profile:', error);
      // Profile doesn't exist, use default form data
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      services: updatedServices
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: '',
          price: '',
          duration: 30,
          description: ''
        }
      ]
    }));
  };

  const removeService = (index) => {
    if (formData.services.length > 1) {
      const updatedServices = formData.services.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        services: updatedServices
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }

    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'City is required';
    }

    if (!formData.location.state.trim()) {
      newErrors['location.state'] = 'State is required';
    }

    if (!formData.location.zipCode.trim()) {
      newErrors['location.zipCode'] = 'Zip code is required';
    }

    // Validate services
    formData.services.forEach((service, index) => {
      if (!service.name.trim()) {
        newErrors[`service${index}Name`] = 'Service name is required';
      }
      if (!service.price || service.price <= 0) {
        newErrors[`service${index}Price`] = 'Valid price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (barberProfile) {
        // Update existing profile
        await axios.put(`/api/barbers/${barberProfile._id}`, formData);
        toast.success('Profile updated successfully!');
      } else {
        // Create new profile
        await axios.post('/api/barbers', formData);
        toast.success('Profile created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile save error:', error);
      const message = error.response?.data?.message || 'Failed to save profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-8">
          {barberProfile ? 'Update Barber Profile' : 'Create Barber Profile'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4 flex items-center">
              <FaStore className="mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-secondary-700 mb-2">
                  Shop Name
                </label>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  value={formData.shopName}
                  onChange={handleChange}
                  className={`input-field ${errors.shopName ? 'border-red-500' : ''}`}
                  placeholder="Enter your shop name"
                />
                {errors.shopName && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopName}</p>
                )}
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-secondary-700 mb-2">
                  Years of Experience
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Describe your services and expertise..."
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-secondary-700 mb-2">
                  Address
                </label>
                <input
                  id="address"
                  name="location.address"
                  type="text"
                  value={formData.location.address}
                  onChange={handleChange}
                  className={`input-field ${errors['location.address'] ? 'border-red-500' : ''}`}
                  placeholder="Enter your address"
                />
                {errors['location.address'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.address']}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-secondary-700 mb-2">
                  City
                </label>
                <input
                  id="city"
                  name="location.city"
                  type="text"
                  value={formData.location.city}
                  onChange={handleChange}
                  className={`input-field ${errors['location.city'] ? 'border-red-500' : ''}`}
                  placeholder="Enter your city"
                />
                {errors['location.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.city']}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-secondary-700 mb-2">
                  State
                </label>
                <input
                  id="state"
                  name="location.state"
                  type="text"
                  value={formData.location.state}
                  onChange={handleChange}
                  className={`input-field ${errors['location.state'] ? 'border-red-500' : ''}`}
                  placeholder="Enter your state"
                />
                {errors['location.state'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.state']}</p>
                )}
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-secondary-700 mb-2">
                  Zip Code
                </label>
                <input
                  id="zipCode"
                  name="location.zipCode"
                  type="text"
                  value={formData.location.zipCode}
                  onChange={handleChange}
                  className={`input-field ${errors['location.zipCode'] ? 'border-red-500' : ''}`}
                  placeholder="Enter your zip code"
                />
                {errors['location.zipCode'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.zipCode']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-4 flex items-center">
              <FaTools className="mr-2" />
              Services
            </h2>
            
            {formData.services.map((service, index) => (
              <div key={index} className="border border-secondary-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-secondary-800">Service {index + 1}</h3>
                  {formData.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      className={`input-field ${errors[`service${index}Name`] ? 'border-red-500' : ''}`}
                      placeholder="e.g., Haircut, Beard Trim"
                    />
                    {errors[`service${index}Name`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`service${index}Name`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={service.price}
                      onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                      className={`input-field ${errors[`service${index}Price`] ? 'border-red-500' : ''}`}
                      placeholder="500"
                    />
                    {errors[`service${index}Price`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`service${index}Price`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      value={service.duration}
                      onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value))}
                      className="input-field"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      className="input-field"
                      placeholder="Brief description of the service"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addService}
              className="btn-outline inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Service
            </button>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {barberProfile ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarberProfileForm; 