import mongoose from 'mongoose'

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  userAgent: {
    type: String,
    default: null
  },
  platform: {
    type: String,
    enum: ['web', 'android', 'ios'],
    default: 'web'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for finding user's active subscriptions
pushSubscriptionSchema.index({ userId: 1, isActive: 1 });

// Static method to add or update subscription
pushSubscriptionSchema.statics.addOrUpdate = async function(userId, subscription, userAgent = null) {
  const existing = await this.findOne({ endpoint: subscription.endpoint });
  
  if (existing) {
    existing.keys = subscription.keys;
    existing.userId = userId;
    existing.userAgent = userAgent;
    existing.isActive = true;
    existing.lastUsed = new Date();
    return existing.save();
  }
  
  return this.create({
    userId,
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    userAgent,
    platform: 'web',
    isActive: true
  });
};

// Static method to get user's active subscriptions
pushSubscriptionSchema.statics.getUserSubscriptions = async function(userId) {
  return this.find({ userId, isActive: true });
};

// Static method to deactivate subscription
pushSubscriptionSchema.statics.deactivate = async function(endpoint) {
  return this.updateOne({ endpoint }, { isActive: false });
};

export default mongoose.model('PushSubscription', pushSubscriptionSchema)
