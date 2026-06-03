import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, Home, Play, Zap, Target, Flame } from 'lucide-react';

export default function TimeTrialSelector() {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(8);
  const [selectedTime, setSelectedTime] = useState(180);

  const sizeOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  const timeOptions = [
    { value: 60, label: '1 Min', difficulty: 'Extreme', color: '#FF8A8A' },
    { value: 120, label: '2 Min', difficulty: 'Hard', color: '#F5B800' },
    { value: 180, label: '3 Min', difficulty: 'Medium', color: '#4ADE80' },
    { value: 300, label: '5 Min', difficulty: 'Easy', color: '#60A5FA' },
  ];

  const handleStartGame = () => navigate(`/time-trial-game?size=${selectedSize}&time=${selectedTime}`);

  return (
    <div style={{ minHeight: '100vh', background: '#0C0505',
      backgroundImage: `radial-gradient(ellipse at 15% 0%, rgba(196,30,30,0.1) 0%, transparent 50%),
                        radial-gradient(ellipse at 85% 100%, rgba(100,8,8,0.12) 0%, transparent 50%)`,
      fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px clamp(14px,4vw,28px)', background: 'rgba(12,5,5,0.9)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(245,184,0,0.1)' }}>
        <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/play')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px',
            background: 'rgba(30,18,18,0.8)', border: '1px solid rgba(245,184,0,0.14)',
            color: 'rgba(232,213,176,0.8)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back
        </motion.button>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <Clock size={32} color="#F5B800" />
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(20px,5vw,28px)', fontWeight: 700, color: '#FAF7F0', margin: 0 }}>Time Trial Mode</h1>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(245,184,0,0.55)', marginTop: '4px', letterSpacing: '0.1em' }}>Beat the Clock!</p>
        </div>
        
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}
          style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(30,18,18,0.8)',
            border: '1px solid rgba(245,184,0,0.14)', color: 'rgba(232,213,176,0.8)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
          <Home size={18} />
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(20px,5vw,40px) clamp(14px,4vw,28px)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg, #1E1010, #160A0A)', border: '1px solid rgba(245,184,0,0.15)', borderRadius: '20px', padding: 'clamp(20px,4vw,32px)' }}>
          
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', fontWeight: 600, color: '#F5B800', marginBottom: '16px', textAlign: 'center' }}>Select Board Size</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '10px', marginBottom: '32px' }}>
            {sizeOptions.map((size, i) => (
              <motion.button key={size} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedSize(size)}
                style={{ padding: '12px 8px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: 600,
                  background: selectedSize === size ? 'linear-gradient(135deg, rgba(245,184,0,0.2), rgba(196,30,30,0.1))' : 'rgba(30,18,18,0.8)',
                  border: selectedSize === size ? '2px solid #F5B800' : '1px solid rgba(245,184,0,0.15)',
                  color: selectedSize === size ? '#F5B800' : 'rgba(232,213,176,0.7)' }}>{size}×{size}</motion.button>
            ))}
          </div>

          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', fontWeight: 600, color: '#F5B800', marginBottom: '16px', textAlign: 'center' }}>Select Time Limit</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '32px' }}>
            {timeOptions.map((option, i) => (
              <motion.button key={option.value} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 + 0.2 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedTime(option.value)}
                style={{ padding: '12px 8px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                  background: selectedTime === option.value ? `linear-gradient(135deg, ${option.color}20, rgba(196,30,30,0.1))` : 'rgba(30,18,18,0.8)',
                  border: selectedTime === option.value ? `2px solid ${option.color}` : '1px solid rgba(245,184,0,0.15)' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: selectedTime === option.value ? option.color : 'rgba(232,213,176,0.8)' }}>{option.label}</div>
                <div style={{ fontSize: '11px', color: selectedTime === option.value ? option.color : 'rgba(184,150,122,0.5)' }}>{option.difficulty}</div>
              </motion.button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px',
              background: 'rgba(245,184,0,0.1)', border: '1px solid rgba(245,184,0,0.2)' }}>
              <Zap size={16} color="#F5B800" />
              <span style={{ fontSize: '13px', color: '#F5B800', fontWeight: 600 }}>Race Against Time</span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(184,150,122,0.7)', marginTop: '12px' }}>
              Complete the <strong style={{ color: '#F5B800' }}>{selectedSize}×{selectedSize}</strong> puzzle in <strong style={{ color: '#4ADE80' }}>{selectedTime / 60} minute{selectedTime > 60 ? 's' : ''}</strong> or less!
            </p>
          </div>

          <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(245,184,0,0.3)' }} whileTap={{ scale: 0.97 }}
            onClick={handleStartGame}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 700,
              background: 'linear-gradient(135deg, #F5B800, #C41E1E)', border: 'none', color: '#0C0505', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Play size={22} /> Start Time Trial
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(184,150,122,0.5)', marginTop: '16px' }}>
            ⚡ Faster completion = Higher score bonus!
          </p>
        </motion.div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            style={{ background: 'linear-gradient(135deg, #1E1010, #160A0A)', border: '1px solid rgba(245,184,0,0.15)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Clock size={24} color="#F5B800" />
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: 600, color: '#FAF7F0', margin: 0 }}>Time Challenge</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(184,150,122,0.7)', lineHeight: 1.5 }}>Complete the puzzle before time runs out! The countdown timer will tick down from your selected time limit.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            style={{ background: 'linear-gradient(135deg, #1E1010, #160A0A)', border: '1px solid rgba(245,184,0,0.15)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Target size={24} color="#F5B800" />
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: 600, color: '#FAF7F0', margin: 0 }}>Scoring</h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'rgba(184,150,122,0.7)', lineHeight: 1.6 }}>
              <li>Time bonus for finishing early</li>
              <li>Speed multiplier (1.5x if &gt;50% time left)</li>
              <li>Fewer moves = higher score</li>
              <li>Global leaderboard ranking</li>
            </ul>
          </motion.div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');`}</style>
    </div>
  );
}