const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per appointment
reviewSchema.index({ appointmentId: 1 }, { unique: true });

// Update barber's average rating when review is added/updated
reviewSchema.post('save', async function() {
  await updateBarberRating(this.barberId);
});

reviewSchema.post('findOneAndUpdate', async function() {
  if (this.barberId) {
    await updateBarberRating(this.barberId);
  }
});

reviewSchema.post('findOneAndDelete', async function() {
  if (this.barberId) {
    await updateBarberRating(this.barberId);
  }
});

async function updateBarberRating(barberId) {
  const Review = mongoose.model('Review');
  const BarberProfile = mongoose.model('BarberProfile');
  
  const stats = await Review.aggregate([
    { $match: { barberId: barberId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await BarberProfile.findOneAndUpdate(
      { userId: barberId },
      {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      }
    );
  }
}

module.exports = mongoose.model('Review', reviewSchema); 