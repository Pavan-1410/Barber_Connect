const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barberProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BarberProfile',
    required: true
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      default: 30
    }
  }],
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  notes: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'barber', 'system']
  },
  isRated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ customerId: 1, appointmentDate: -1 });
appointmentSchema.index({ barberId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema); 