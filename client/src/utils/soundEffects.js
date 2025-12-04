// Sound Effects Utility for N-Queens Game

class SoundEffects {
  constructor() {
    this.enabled = true;
    this.volume = 0.5;
    
    // Load sound preferences from localStorage
    const savedPrefs = localStorage.getItem('soundPreferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      this.enabled = prefs.enabled !== undefined ? prefs.enabled : true;
      this.volume = prefs.volume || 0.5;
    }
  }

  // Save preferences
  savePreferences() {
    localStorage.setItem('soundPreferences', JSON.stringify({
      enabled: this.enabled,
      volume: this.volume
    }));
  }

  // Toggle sound
  toggle() {
    this.enabled = !this.enabled;
    this.savePreferences();
    return this.enabled;
  }

  // Set volume (0 to 1)
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.savePreferences();
  }

  // Play a sound using Web Audio API
  playTone(frequency, duration = 100, type = 'sine') {
    if (!this.enabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback error:', error);
    }
  }

  // Place queen sound (ascending tone)
  placeQueen() {
    this.playTone(523.25, 150, 'sine'); // C5
  }

  // Remove queen sound (descending tone)
  removeQueen() {
    this.playTone(392.00, 150, 'sine'); // G4
  }

  // Invalid move sound (low buzz)
  invalidMove() {
    this.playTone(220.00, 200, 'sawtooth'); // A3
  }

  // Hint sound (bell)
  showHint() {
    this.playTone(783.99, 200, 'triangle'); // G5
  }

  // Undo sound (swoosh down)
  undo() {
    setTimeout(() => this.playTone(659.25, 80, 'sine'), 0); // E5
    setTimeout(() => this.playTone(523.25, 80, 'sine'), 60); // C5
  }

  // Redo sound (swoosh up)
  redo() {
    setTimeout(() => this.playTone(523.25, 80, 'sine'), 0); // C5
    setTimeout(() => this.playTone(659.25, 80, 'sine'), 60); // E5
  }

  // Victory sound (fanfare)
  victory() {
    const notes = [
      { freq: 523.25, time: 0, duration: 150 },    // C5
      { freq: 659.25, time: 150, duration: 150 },  // E5
      { freq: 783.99, time: 300, duration: 150 },  // G5
      { freq: 1046.50, time: 450, duration: 300 }  // C6
    ];

    notes.forEach(note => {
      setTimeout(() => this.playTone(note.freq, note.duration, 'sine'), note.time);
    });
  }

  // Game over sound (sad tone)
  gameOver() {
    const notes = [
      { freq: 392.00, time: 0, duration: 200 },   // G4
      { freq: 349.23, time: 200, duration: 200 }, // F4
      { freq: 293.66, time: 400, duration: 400 }  // D4
    ];

    notes.forEach(note => {
      setTimeout(() => this.playTone(note.freq, note.duration, 'sine'), note.time);
    });
  }

  // Timer tick sound
  timerTick() {
    this.playTone(880.00, 50, 'square'); // A5
  }

  // Timer warning (last 10 seconds)
  timerWarning() {
    this.playTone(1046.50, 100, 'sawtooth'); // C6
  }
}

// Create singleton instance
const soundEffects = new SoundEffects();

export default soundEffects;
