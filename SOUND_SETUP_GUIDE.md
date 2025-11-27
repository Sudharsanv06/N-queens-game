# 🔊 Sound Files Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Directory
```bash
mkdir client\public\sounds
```

### Step 2: Download Sound Files

You need **6 sound files** (MP3 format). Here are three options:

---

## Option 1: Free Sound Libraries (Recommended)

### Freesound.org (CC0 License - No attribution needed)

1. Visit https://freesound.org/
2. Search for these terms and download:

**place-queen.mp3**:
- Search: "ui click short"
- Example: https://freesound.org/people/DrMinky/sounds/166186/
- Duration: ~0.2 seconds
- Volume: Medium click sound

**invalid-move.mp3**:
- Search: "error beep short"
- Example: https://freesound.org/people/Bertrof/sounds/131657/
- Duration: ~0.3 seconds
- Volume: Short buzz/beep

**success.mp3**:
- Search: "success chime"
- Example: https://freesound.org/people/LittleRobotSoundFactory/sounds/270404/
- Duration: 1-2 seconds
- Volume: Celebration/win sound

**undo.mp3**:
- Search: "whoosh short"
- Example: https://freesound.org/people/qubodup/sounds/60026/
- Duration: ~0.2 seconds
- Volume: Quick whoosh

**hint.mp3**:
- Search: "notification ding"
- Example: https://freesound.org/people/floraphonic/sounds/38928/
- Duration: ~0.3 seconds
- Volume: Gentle ding

**reset.mp3**:
- Search: "sweep sound"
- Example: https://freesound.org/people/deleted_user_5405837/sounds/399303/
- Duration: ~0.3 seconds
- Volume: Clear/sweep sound

---

## Option 2: Mixkit.co (Free, No Attribution)

1. Visit https://mixkit.co/free-sound-effects/
2. Browse "User Interface" category
3. Download these examples:

- **place-queen.mp3**: "Click" or "Pop" sound
- **invalid-move.mp3**: "Error" or "Buzz" sound
- **success.mp3**: "Win" or "Level complete" sound
- **undo.mp3**: "Back" or "Whoosh" sound
- **hint.mp3**: "Notification" sound
- **reset.mp3**: "Sweep" or "Clear" sound

Direct links:
- UI Sounds: https://mixkit.co/free-sound-effects/click/
- Game Sounds: https://mixkit.co/free-sound-effects/game/

---

## Option 3: Use Placeholder Sounds

If you just want to test, use these placeholder data URIs in `sounds.js`:

```javascript
// Quick test sounds (no files needed)
const soundFiles = {
  placeQueen: 'data:audio/mp3;base64,//MkxAAHAAAAAAAAAAB...', // Add base64 here
  invalidMove: '/sounds/invalid-move.mp3', // Will fail gracefully
  success: '/sounds/success.mp3',
  undo: '/sounds/undo.mp3',
  hint: '/sounds/hint.mp3',
  reset: '/sounds/reset.mp3'
};
```

Or just skip sound files - the app works fine with console warnings.

---

## File Naming (IMPORTANT!)

Files must be named **exactly** as shown:
```
client/public/sounds/
├── place-queen.mp3
├── invalid-move.mp3
├── success.mp3
├── undo.mp3
├── hint.mp3
└── reset.mp3
```

**Case-sensitive!** Use lowercase with hyphens.

---

## File Specifications

### Format: MP3
- Codec: MPEG-1 Audio Layer 3
- Bit rate: 128 kbps (or lower, 64 kbps is fine)
- Sample rate: 44.1 kHz or 22.05 kHz
- Channels: Mono (stereo works but mono is smaller)

### Size Guidelines:
- Short sounds (0.2-0.3s): 5-15 KB
- Medium sounds (1-2s): 20-50 KB
- Total for all 6: ~100-200 KB

---

## Converting Audio Files

If you have WAV or other formats, convert to MP3:

### Using Online Tools:
1. Visit https://cloudconvert.com/
2. Upload your WAV file
3. Convert to MP3
4. Download and rename

### Using FFmpeg (Command Line):
```bash
# Install FFmpeg first
ffmpeg -i input.wav -acodec libmp3lame -ab 64k output.mp3
```

---

## Testing Sounds

### 1. Place files in directory:
```
client/public/sounds/
├── place-queen.mp3 ✅
├── invalid-move.mp3 ✅
├── success.mp3 ✅
├── undo.mp3 ✅
├── hint.mp3 ✅
└── reset.mp3 ✅
```

### 2. Restart dev server:
```bash
cd client
npm run dev
```

### 3. Check browser console:
- ✅ No errors = sounds loaded successfully
- ⚠️ Warnings = sounds missing (app still works)

### 4. Test in game:
1. Click sound toggle (should turn green)
2. Place a queen → Hear "place-queen" sound
3. Click attacked cell → Hear "invalid-move" sound
4. Complete puzzle → Hear "success" sound
5. Press **U** → Hear "undo" sound
6. Press **H** → Hear "hint" sound
7. Press **R** → Hear "reset" sound

---

## Troubleshooting

### ❌ "Failed to load sound" error

**Cause**: File not found or wrong name

**Fix**:
```bash
# Check files exist
dir client\public\sounds

# Files should be:
place-queen.mp3
invalid-move.mp3
success.mp3
undo.mp3
hint.mp3
reset.mp3
```

### ❌ Sounds don't play

**Cause 1**: Sound toggle is off
- Click the "Sound On/Off" button in game

**Cause 2**: Browser autoplay policy
- Most browsers require user interaction first
- Click anywhere in game, then sounds will work

**Cause 3**: File format not supported
- Use MP3 format (universally supported)
- Convert WAV/OGG/other formats to MP3

### ❌ Sounds are too loud/quiet

**Fix in code**: Adjust volume in `sounds.js`:
```javascript
this.volume = 0.5; // Change to 0.1 (quiet) or 1.0 (loud)
```

Or add volume slider in UI (Day 4 feature idea!).

---

## Custom Sounds

Want different sounds? Easy!

1. Find your MP3 files
2. Rename to match required names:
   - `place-queen.mp3`
   - `invalid-move.mp3`
   - `success.mp3`
   - `undo.mp3`
   - `hint.mp3`
   - `reset.mp3`
3. Place in `client/public/sounds/`
4. Reload game

**No code changes needed!**

---

## Performance Tips

### Optimize File Sizes:
```bash
# Reduce bit rate to 64 kbps (good for UI sounds)
ffmpeg -i input.mp3 -ab 64k output.mp3

# Convert to mono (half the size)
ffmpeg -i input.mp3 -ac 1 output.mp3

# Trim silence
ffmpeg -i input.mp3 -af silenceremove=1:0:-50dB output.mp3
```

### Lazy Loading (Advanced):
If you want to load sounds on-demand instead of preload:

```javascript
// In sounds.js, change:
audio.preload = 'auto'; // to:
audio.preload = 'none';
```

---

## License Considerations

### CC0 (Public Domain):
✅ Use freely, no attribution needed

### CC BY (Attribution):
✅ Use freely, but credit the author
- Add credits in `CREDITS.md` or About page

### Free for Commercial Use:
✅ Check site's license terms
- Most free sound sites allow commercial use

### Avoid:
❌ Copyrighted sounds without permission
❌ Sounds from games/movies (likely copyrighted)

---

## Example Credits File

If using sounds with attribution requirements:

**CREDITS.md**:
```markdown
# Sound Effects Credits

## place-queen.mp3
- Author: DrMinky
- Source: Freesound.org
- License: CC0 (Public Domain)

## invalid-move.mp3
- Author: Bertrof
- Source: Freesound.org
- License: CC BY 3.0

[Add others as needed]
```

---

## Quick Start Command

```bash
# Create directory
mkdir client\public\sounds

# Download sounds (manually from links above)
# Then verify:
dir client\public\sounds

# Should show 6 MP3 files
# Restart dev server and test!
```

---

## Status Without Sounds

**The app works perfectly without sound files!**

You'll just see harmless console warnings:
```
⚠️ Failed to load sound: /sounds/place-queen.mp3
```

All features still work:
- ✅ Timer
- ✅ Move history  
- ✅ Keyboard shortcuts
- ✅ Sound toggle (just won't play anything)
- ✅ All game mechanics

---

## Ready to Test?

1. ✅ Downloaded 6 MP3 files
2. ✅ Placed in `client/public/sounds/`
3. ✅ Named correctly (lowercase, hyphens)
4. ✅ Restarted dev server
5. ✅ Opened game at `/play-game`
6. ✅ Clicked "Sound On" button
7. ✅ Played game and heard sounds!

**Enjoy your enhanced N-Queens game with sound! 🔊🎮**
