import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  action: { type: String, enum: ['place', 'remove'], required: true },
  timestamp: { type: Date, required: true, default: Date.now }
}, { _id: false });

const gameSaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  n: {
    type: Number,
    required: true,
    min: 4,
    max: 20
  },
  boardState: {
    type: [[Number]],
    required: true,
    validate: {
      validator: function(board) {
        return board.length === this.n && board.every(row => row.length === this.n);
      },
      message: 'Board state dimensions must match n x n'
    }
  },
  moves: {
    type: [moveSchema],
    default: []
  },
  placedQueens: {
    type: Number,
    default: 0,
    min: 0
  },
  timer: {
    type: Number,
    default: 0,
    min: 0
  },
  hintsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    required: true
  },
  metadata: {
    device: { type: String, default: 'unknown' },
    appVersion: { type: String, default: '1.0.0' },
    platform: { type: String, default: 'web' }
  }
}, {
  timestamps: true
});

gameSaveSchema.index({ userId: 1, sessionId: 1 });
gameSaveSchema.index({ sessionId: 1 });
gameSaveSchema.index({ lastUpdated: -1 });
gameSaveSchema.index({ userId: 1, lastUpdated: -1 });

gameSaveSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

gameSaveSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    sessionId: this.sessionId,
    n: this.n,
    boardState: this.boardState,
    moves: this.moves,
    placedQueens: this.placedQueens,
    timer: this.timer,
    hintsUsed: this.hintsUsed,
    lastUpdated: this.lastUpdated,
    createdAt: this.createdAt,
    metadata: this.metadata
  };
};

gameSaveSchema.statics.findLatestForUser = async function(userId, sessionId = null) {
  const query = userId ? { userId } : { sessionId };
  return this.findOne(query).sort({ lastUpdated: -1 });
};

gameSaveSchema.statics.upsertSave = async function(saveData) {
  const { userId, sessionId } = saveData;
  const query = userId ? { userId, sessionId } : { sessionId };
  
  return this.findOneAndUpdate(
    query,
    { $set: saveData },
    { new: true, upsert: true, runValidators: true }
  );
};

export default mongoose.model('GameSave', gameSaveSchema);
