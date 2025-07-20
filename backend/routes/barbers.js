const express = require('express');
const { body, validationResult } = require('express-validator');
const BarberProfile = require('../models/BarberProfile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all barbers with filters
// @route   GET /api/barbers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, rating, service, userId, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    
    if (service) {
      query['services.name'] = { $regex: service, $options: 'i' };
    }
    
    if (userId) {
      query.userId = userId;
    }

    const barbers = await BarberProfile.find(query)
      .populate('userId', 'name email phone avatar')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await BarberProfile.countDocuments(query);

    res.json({
      barbers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get barbers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single barber
// @route   GET /api/barbers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const barber = await BarberProfile.findById(req.params.id)
      .populate('userId', 'name email phone avatar');

    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    res.json(barber);
  } catch (error) {
    console.error('Get barber error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create barber profile
// @route   POST /api/barbers
// @access  Private (Barber only)
router.post('/', protect, authorize('barber'), [
  body('shopName').trim().isLength({ min: 2 }).withMessage('Shop name is required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.state').trim().notEmpty().withMessage('State is required'),
  body('location.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('services.*.name').trim().notEmpty().withMessage('Service name is required'),
  body('services.*.price').isFloat({ min: 0 }).withMessage('Service price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if profile already exists
    const existingProfile = await BarberProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Barber profile already exists' });
    }

    const barberProfile = await BarberProfile.create({
      userId: req.user._id,
      ...req.body
    });

    const populatedProfile = await BarberProfile.findById(barberProfile._id)
      .populate('userId', 'name email phone avatar');

    res.status(201).json(populatedProfile);
  } catch (error) {
    console.error('Create barber profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update barber profile
// @route   PUT /api/barbers/:id
// @access  Private (Barber only)
router.put('/:id', protect, authorize('barber'), [
  body('shopName').optional().trim().isLength({ min: 2 }).withMessage('Shop name must be at least 2 characters'),
  body('services.*.name').optional().trim().notEmpty().withMessage('Service name cannot be empty'),
  body('services.*.price').optional().isFloat({ min: 0 }).withMessage('Service price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const barberProfile = await BarberProfile.findById(req.params.id);

    if (!barberProfile) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    // Check if user owns this profile
    if (barberProfile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const updatedProfile = await BarberProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone avatar');

    res.json(updatedProfile);
  } catch (error) {
    console.error('Update barber profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete barber profile
// @route   DELETE /api/barbers/:id
// @access  Private (Barber only)
router.delete('/:id', protect, authorize('barber'), async (req, res) => {
  try {
    const barberProfile = await BarberProfile.findById(req.params.id);

    if (!barberProfile) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    // Check if user owns this profile
    if (barberProfile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this profile' });
    }

    await BarberProfile.findByIdAndDelete(req.params.id);

    res.json({ message: 'Barber profile deleted' });
  } catch (error) {
    console.error('Delete barber profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get barber's own profile
// @route   GET /api/barbers/profile/me
// @access  Private (Barber only)
router.get('/profile/me', protect, authorize('barber'), async (req, res) => {
  try {
    const barberProfile = await BarberProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone avatar');

    if (!barberProfile) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    res.json(barberProfile);
  } catch (error) {
    console.error('Get own profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update barber services
// @route   PUT /api/barbers/:id/services
// @access  Private (Barber only)
router.put('/:id/services', protect, authorize('barber'), [
  body('services').isArray().withMessage('Services must be an array'),
  body('services.*.name').trim().notEmpty().withMessage('Service name is required'),
  body('services.*.price').isFloat({ min: 0 }).withMessage('Service price must be a positive number'),
  body('services.*.duration').optional().isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes')
], async (req, res) => {
  try {
    console.log('Services update request:', {
      barberId: req.params.id,
      userId: req.user._id,
      services: req.body.services
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const barberProfile = await BarberProfile.findById(req.params.id);

    if (!barberProfile) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    // Check if user owns this profile
    if (barberProfile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Update only the services field
    barberProfile.services = req.body.services;
    await barberProfile.save();

    const updatedProfile = await BarberProfile.findById(req.params.id)
      .populate('userId', 'name email phone avatar');

    console.log('Services updated successfully');
    res.json(updatedProfile);
  } catch (error) {
    console.error('Update services error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 