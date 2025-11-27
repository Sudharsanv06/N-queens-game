import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  n: {
    type: Number,
    required: true,
    min: 4,
    max: 20
  },
  startAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  endAt: {
    type: Date,
    default: null
  },
  movesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  hintsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  analytics: {
    totalTime: { type: Number, default: 0 },
    averageMoveTime: { type: Number, default: 0 },
    wrongMoves: { type: Number, default: 0 },
    correctMoves: { type: Number, default: 0 },
    pauseCount: { type: Number, default: 0 }
  },
  metadata: {
    device: { type: String, default: 'unknown' },
    appVersion: { type: String, default: '1.0.0' },
    platform: { type: String, default: 'web' },
    userAgent: { type: String, default: '' }
  }
}, {
  timestamps: true
});

sessionSchema.index({ userId: 1, startAt: -1 });
sessionSchema.index({ sessionId: 1, userId: 1 });
sessionSchema.index({ completed: 1, startAt: -1 });

sessionSchema.methods.incrementMoves = function() {
  this.movesCount += 1;
  return this.save();
};

sessionSchema.methods.incrementHints = function() {
  this.hintsUsed += 1;
  return this.save();
};

sessionSchema.methods.complete = function(analytics = {}) {
  this.completed = true;
  this.endAt = new Date();
  if (Object.keys(analytics).length > 0) {
    this.analytics = { ...this.analytics, ...analytics };
  }
  return this.save();
};

sessionSchema.methods.updateAnalytics = function(analyticsUpdate) {
  this.analytics = { ...this.analytics, ...analyticsUpdate };
  return this.save();
};

sessionSchema.statics.findActiveSession = async function(sessionId) {
  return this.findOne({ sessionId, completed: false });
};

sessionSchema.statics.createSession = async function(sessionData) {
  const session = new this(sessionData);
  return session.save();
};

sessionSchema.statics.getUserSessions = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ startAt: -1 })
    .limit(limit);
};

export default mongoose.model('Session', sessionSchema);
