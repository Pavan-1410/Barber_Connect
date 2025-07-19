const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const BarberProfile = require('../models/BarberProfile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Customer only)
router.post('/', protect, authorize('customer'), [
  body('barberId').isMongoId().withMessage('Valid barber ID is required'),
  body('barberProfileId').isMongoId().withMessage('Valid barber profile ID is required'),
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { barberId, barberProfileId, services, appointmentDate, appointmentTime, notes } = req.body;

    // Check if barber exists
    const barberProfile = await BarberProfile.findById(barberProfileId);
    if (!barberProfile) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const validatedServices = [];

    for (const service of services) {
      const barberService = barberProfile.services.find(s => s.name === service.name);
      if (!barberService) {
        return res.status(400).json({ message: `Service ${service.name} not found for this barber` });
      }
      totalAmount += barberService.price;
      validatedServices.push({
        name: barberService.name,
        price: barberService.price,
        duration: barberService.duration
      });
    }

    // Check if appointment date is in the future
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ message: 'Appointment date must be in the future' });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      barberId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'approved'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      customerId: req.user._id,
      barberId,
      barberProfileId,
      services: validatedServices,
      appointmentDate,
      appointmentTime,
      totalAmount,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customerId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('barberProfileId', 'shopName location');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's appointments
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'barber') {
      query.barberId = req.user._id;
    }
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('barberProfileId', 'shopName location')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('barberProfileId', 'shopName location');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'customer' && appointment.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    if (req.user.role === 'barber' && appointment.barberId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update appointment status (barber only)
// @route   PUT /api/appointments/:id/status
// @access  Private (Barber only)
router.put('/:id/status', protect, authorize('barber'), [
  body('status').isIn(['approved', 'rejected', 'completed']).withMessage('Valid status is required'),
  body('cancellationReason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if barber owns this appointment
    if (appointment.barberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    appointment.status = status;
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('customerId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('barberProfileId', 'shopName location');

    res.json(populatedAppointment);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel appointment (customer only)
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Customer only)
router.put('/:id/cancel', protect, authorize('customer'), [
  body('cancellationReason').optional().trim()
], async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if customer owns this appointment
    if (appointment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment cannot be cancelled' });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = 'customer';
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('customerId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('barberProfileId', 'shopName location');

    res.json(populatedAppointment);
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 