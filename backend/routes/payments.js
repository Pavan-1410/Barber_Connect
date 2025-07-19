const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Dummy payment gateway simulation
const dummyPaymentGateway = {
  createOrder: async (amount, currency, receipt) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      currency: currency,
      receipt: receipt,
      status: 'created'
    };
  },
  
  verifyPayment: (orderId, paymentId, signature) => {
    // Simulate payment verification
    // In real implementation, this would verify the signature
    return true;
  }
};

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private (Customer only)
router.post('/create-order', protect, authorize('customer'), [
  body('appointmentId').isMongoId().withMessage('Valid appointment ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this appointment' });
    }

    // Check if appointment is pending payment
    if (appointment.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Payment already processed for this appointment' });
    }

    // Create dummy payment order
    const order = await dummyPaymentGateway.createOrder(
      Math.round(appointment.totalAmount * 100), // Convert to paise
      'INR',
      `appointment_${appointmentId}`
    );

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appointmentId: appointmentId
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (Customer only)
router.post('/verify', protect, authorize('customer'), [
  body('appointmentId').isMongoId().withMessage('Valid appointment ID is required'),
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('signature').notEmpty().withMessage('Signature is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId, paymentId, orderId, signature } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to verify payment for this appointment' });
    }

    // Verify dummy payment
    const isPaymentValid = dummyPaymentGateway.verifyPayment(orderId, paymentId, signature);
    
    if (!isPaymentValid) {
      return res.status(400).json({ message: 'Invalid payment verification' });
    }

    // Update appointment payment status
    appointment.paymentStatus = 'paid';
    appointment.paymentId = paymentId;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customerId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('barberProfileId', 'shopName location');

    res.json({
      message: 'Payment verified successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get payment status
// @route   GET /api/payments/status/:appointmentId
// @access  Private
router.get('/status/:appointmentId', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'customer' && appointment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    if (req.user.role === 'barber' && appointment.barberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json({
      paymentStatus: appointment.paymentStatus,
      paymentId: appointment.paymentId,
      totalAmount: appointment.totalAmount
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Simulate payment (for testing)
// @route   POST /api/payments/simulate
// @access  Private (Customer only)
router.post('/simulate', protect, authorize('customer'), [
  body('appointmentId').isMongoId().withMessage('Valid appointment ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this appointment' });
    }

    // Simulate successful payment
    appointment.paymentStatus = 'paid';
    appointment.paymentId = `sim_${Date.now()}`;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customerId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('barberProfileId', 'shopName location');

    res.json({
      message: 'Payment simulated successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 