// client/src/utils/sounds.js
// Sound effect management for N-Queens game

/**
 * Sound Manager Class
 * Handles preloading, playing, and volume control for game sound effects
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.initialized = false;
  }

  /**
   * Initialize and preload sound effects
   * Call this once when the app loads
   */
  init() {
    if (this.initialized) return;

    // Define sound files
    // Note: These files need to be placed in client/public/sounds/
    const soundFiles = {
      placeQueen: '/sounds/place-queen.mp3',
      invalidMove: '/sounds/invalid-move.mp3',
      success: '/sounds/success.mp3',
      undo: '/sounds/undo.mp3',
      hint: '/sounds/hint.mp3',
      reset: '/sounds/reset.mp3'
    };

    // Preload all sounds
    Object.entries(soundFiles).forEach(([key, path]) => {
      try {
        const audio = new Audio(path);
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // Handle load errors gracefully
        audio.addEventListener('error', () => {
          console.warn(`Failed to load sound: ${path}`);
        });
        
        this.sounds[key] = audio;
      } catch (error) {
        console.warn(`Error creating audio for ${key}:`, error);
      }
    });

    this.initialized = true;
  }

  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound to play
   */
  play(soundName) {
    if (!this.enabled || !this.sounds[soundName]) {
      return;
    }

    try {
      const sound = this.sounds[soundName];
      
      // Clone the audio to allow overlapping plays
      const audioClone = sound.cloneNode();
      audioClone.volume = this.volume;
      
      // Play and remove after completion
      audioClone.play().catch(error => {
        console.warn(`Failed to play sound ${soundName}:`, error);
      });
    } catch (error) {
      console.warn(`Error playing sound ${soundName}:`, error);
    }
  }

  /**
   * Set volume for all sounds
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  /**
   * Enable or disable all sounds
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get current volume
   * @returns {number}
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Export for use in components
export default soundManager;

/**
 * Hook-friendly wrapper functions
 */
export const initSounds = () => soundManager.init();
export const playSound = (soundName) => soundManager.play(soundName);
export const setSoundVolume = (volume) => soundManager.setVolume(volume);
export const setSoundEnabled = (enabled) => soundManager.setEnabled(enabled);
export const isSoundEnabled = () => soundManager.isEnabled();
export const getSoundVolume = () => soundManager.getVolume();
export const stopAllSounds = () => soundManager.stopAll();

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create directory: client/public/sounds/
 * 
 * 2. Add these sound files (you can use free sounds from freesound.org or zapsplat.com):
 *    - place-queen.mp3 (short "click" or "place" sound, ~0.2s)
 *    - invalid-move.mp3 (short "error" or "buzz" sound, ~0.3s)
 *    - success.mp3 (celebration sound, ~1-2s)
 *    - undo.mp3 (short "whoosh" sound, ~0.2s)
 *    - hint.mp3 (short "ding" or "notification" sound, ~0.3s)
 *    - reset.mp3 (short "sweep" or "clear" sound, ~0.3s)
 * 
 * 3. Alternative - Use placeholder beeps:
 *    If you don't have sound files, create silent placeholders:
 *    
 *    // Create empty MP3 files or use data URLs for simple beeps
 *    // The app will work without sounds, warnings will just appear in console
 * 
 * 4. Free Sound Resources:
 *    - https://freesound.org/ (CC0 license sounds)
 *    - https://mixkit.co/free-sound-effects/ (free for commercial use)
 *    - https://www.zapsplat.com/ (free with attribution)
 * 
 * 5. Recommended searches:
 *    - "chess piece place"
 *    - "ui click"
 *    - "error beep"
 *    - "success chime"
 *    - "whoosh"
 *    - "notification"
 */
