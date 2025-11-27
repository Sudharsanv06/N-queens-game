# N-Queens Game - Environment Setup Guide

## 🔒 Security Best Practices

### 1. Environment Variables Setup

#### Root `.env` (Development):
```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
```

Required variables:
```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/nqueens-game
JWT_SECRET=your-32-character-minimum-secret-key-here
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
```

#### Server `.env`:
```bash
cd server
cp .env.example .env
nano .env
```

### 2. Generate Secure Secrets

#### Option 1: Using Node.js
```javascript
// Generate JWT secret (run in node terminal)
require('crypto').randomBytes(64).toString('hex')
```

#### Option 2: Using OpenSSL
```bash
# Generate 64-character secret
openssl rand -hex 64

# Generate 32-character secret
openssl rand -base64 32
```

#### Option 3: Using PowerShell (Windows)
```powershell
# Generate secure random string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 3. Production Environment

#### Important Changes for Production:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nqueens-game
JWT_SECRET=<use-openssl-generated-secret>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 4. MongoDB Setup

#### Local Development:
```bash
# Install MongoDB
# Windows: Download from mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
# Windows: Start MongoDB service
# Mac/Linux: mongod --dbpath /path/to/data
```

#### MongoDB Atlas (Cloud - Recommended):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `MONGO_URI` in `.env`

### 5. Email Configuration (Optional)

For Gmail:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # NOT your regular password!
```

**Get App Password:**
1. Google Account → Security
2. Enable 2-Factor Authentication
3. App Passwords → Generate new
4. Use generated password in `.env`

### 6. CORS Configuration

#### Development (Multiple Origins):
```env
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:8100
```

#### Production:
```env
CLIENT_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

### 7. Rate Limiting

```env
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX=100    # requests per IP per window
```

Adjust based on your needs:
- **Strict**: `RATE_LIMIT_MAX=50`
- **Normal**: `RATE_LIMIT_MAX=100`
- **Relaxed**: `RATE_LIMIT_MAX=200`

---

## 📋 Environment Variables Checklist

### Required (Minimum):
- [ ] `NODE_ENV`
- [ ] `MONGO_URI`
- [ ] `JWT_SECRET` (minimum 32 characters)
- [ ] `PORT`
- [ ] `CLIENT_ORIGIN`

### Optional (Recommended):
- [ ] `JWT_EXPIRES_IN`
- [ ] `RATE_LIMIT_WINDOW`
- [ ] `RATE_LIMIT_MAX`

### Optional (Features):
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`
- [ ] `VAPID_PUBLIC_KEY`
- [ ] `VAPID_PRIVATE_KEY`

---

## 🚫 What NOT to Do

❌ Never commit `.env` files to Git  
❌ Never use weak JWT secrets (< 32 characters)  
❌ Never hardcode secrets in source code  
❌ Never share production `.env` files  
❌ Never use same secrets across environments  

---

## ✅ Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] JWT secret is at least 32 characters
- [ ] MongoDB uses authentication in production
- [ ] CORS is configured for specific origins
- [ ] Rate limiting is enabled
- [ ] HTTPS is used in production
- [ ] Environment variables are backed up securely
- [ ] Different secrets for dev/staging/production

---

## 🔄 Environment Migration

### From Development to Production:
1. Never copy `.env` directly
2. Generate new secrets for production
3. Update MongoDB URI to production cluster
4. Update CLIENT_ORIGIN to production domain
5. Set `NODE_ENV=production`
6. Test thoroughly in staging first

### Backup Strategy:
```bash
# Create encrypted backup (use strong password)
tar -czf - .env | openssl enc -aes-256-cbc -salt -out env-backup.tar.gz.enc

# Restore from backup
openssl enc -d -aes-256-cbc -in env-backup.tar.gz.enc | tar xz
```

---

## 🧪 Testing Environment Variables

Create `server/test-env.js`:
```javascript
import dotenv from 'dotenv'
dotenv.config()

console.log('Environment Check:')
console.log('✓ NODE_ENV:', process.env.NODE_ENV)
console.log('✓ PORT:', process.env.PORT)
console.log('✓ MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing')
console.log('✓ JWT_SECRET:', process.env.JWT_SECRET ? `✓ Set (${process.env.JWT_SECRET.length} chars)` : '✗ Missing')
console.log('✓ CLIENT_ORIGIN:', process.env.CLIENT_ORIGIN)

// Validate
const issues = []
if (!process.env.MONGO_URI) issues.push('MONGO_URI missing')
if (!process.env.JWT_SECRET) issues.push('JWT_SECRET missing')
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) issues.push('JWT_SECRET too short')

if (issues.length > 0) {
  console.error('\n❌ Issues found:', issues.join(', '))
  process.exit(1)
} else {
  console.log('\n✅ All required environment variables are set!')
}
```

Run: `node server/test-env.js`

---

## 📚 Quick Reference

### Development Setup:
```bash
# 1. Copy environment files
cp .env.example .env
cd server && cp .env.example .env && cd ..

# 2. Install dependencies
npm run install:all

# 3. Start MongoDB (if local)
mongod

# 4. Start development servers
npm run dev
```

### Production Setup:
```bash
# 1. Set environment variables (platform-specific)
# Heroku: heroku config:set KEY=VALUE
# Vercel: vercel env add
# Railway: Set in dashboard
# AWS: Use AWS Secrets Manager

# 2. Build and deploy
npm run build
npm start
```

---

## 🆘 Troubleshooting

### "JWT_SECRET is not defined"
→ Check `.env` file exists in server folder  
→ Verify variable name is exact: `JWT_SECRET`  
→ Restart server after changing `.env`

### "CORS Error"
→ Add your frontend URL to `CLIENT_ORIGIN`  
→ Use comma-separated list for multiple origins  
→ Check protocol (http vs https)

### "Cannot connect to MongoDB"
→ Verify MongoDB is running (local)  
→ Check connection string format  
→ Verify network access (Atlas: IP whitelist)  
→ Check username/password

### "Rate limit exceeded"
→ Increase `RATE_LIMIT_MAX` in development  
→ Clear browser cache/cookies  
→ Use different IP or wait for window to reset

---

**Last Updated**: Day 1 Stabilization  
**Status**: ✅ Production Ready
