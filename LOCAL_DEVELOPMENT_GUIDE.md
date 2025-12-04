# 🚀 Local Development Setup Guide

## ✅ Setup Complete!

All hosting configurations have been removed. Your app is now configured for **local development only**.

---

## 📋 Prerequisites

### 1. Install MongoDB Compass
- Download from: https://www.mongodb.com/try/download/compass
- Install and launch MongoDB Compass
- **Connection String**: `mongodb://localhost:27017`
- **Database Name**: `n-queens-game` (will be created automatically)

### 2. Ensure MongoDB is Running
MongoDB Compass requires MongoDB Server to be running on your machine:
- **Windows**: Download MongoDB Community Server from https://www.mongodb.com/try/download/community
- During installation, ensure "Install MongoDB as a Service" is checked
- MongoDB will run automatically on `localhost:27017`

---

## 🔧 Configuration Summary

### Server Configuration (`.env`)
```env
MONGO_URI=mongodb://localhost:27017/n-queens-game
PORT=5000
NODE_ENV=development
```

### Client Configuration (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🎮 Running the Application

### Step 1: Start MongoDB
1. Open **MongoDB Compass**
2. Connect to: `mongodb://localhost:27017`
3. You should see a connection established

### Step 2: Start Backend Server
```powershell
cd server
npm install
npm run dev
```
✅ Server will run on: **http://localhost:5000**

### Step 3: Start Frontend Client (New Terminal)
```powershell
cd client
npm install
npm run dev
```
✅ Client will run on: **http://localhost:5173**

---

## 🧪 Testing Your Setup

### 1. Test Backend
Open browser to: http://localhost:5000/api/health
- Should return: `{"status":"ok"}`

### 2. Test Frontend
Open browser to: http://localhost:5173
- Should load the N-Queens Game

### 3. Test Database Connection
In MongoDB Compass:
- Look for `n-queens-game` database
- After registration/login, check `users` collection

---

## 🛠️ Making Changes

### Frontend Changes (CSS, Components, etc.)
1. Edit files in `client/src/`
2. Hot reload will automatically update the browser
3. Test immediately at http://localhost:5173

### Backend Changes (API, Routes, etc.)
1. Edit files in `server/`
2. Server auto-restarts with nodemon
3. Test API endpoints using browser or Postman

### Database Changes
1. View/Edit data directly in MongoDB Compass
2. Run queries, add/delete documents
3. Changes reflect immediately in the app

---

## 📊 Viewing Data

### MongoDB Compass
- **Connection**: `mongodb://localhost:27017`
- **Database**: `n-queens-game`
- **Collections**:
  - `users` - User accounts
  - `games` - Game records
  - `achievements` - User achievements
  - `dailychallenges` - Daily challenge data
  - `leaderboards` - Leaderboard entries

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix**: Start MongoDB service
```powershell
net start MongoDB
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Fix**: Kill the process or change port in `server/.env`

### CORS Errors
**Fix**: Ensure client URL is in `CLIENT_ORIGIN` in `server/.env`

---

## ✅ Verification Checklist

- [ ] MongoDB Compass connected to `mongodb://localhost:27017`
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Can register/login successfully
- [ ] Can play games and save progress
- [ ] Data appears in MongoDB Compass

---

## 🚀 When Ready to Deploy

Once you've tested and finalized your changes:

### 1. Update MongoDB for Production
- Create MongoDB Atlas cluster
- Update `MONGO_URI` in server `.env`

### 2. Deploy Backend (Render)
```bash
# Create new Web Service on Render
# Connect GitHub repo
# Set environment variables from server/.env
```

### 3. Deploy Frontend (Vercel)
```bash
# Create new vercel.json in client/
# Update VITE_API_URL to production backend URL
# Deploy via Vercel CLI or GitHub integration
```

### 4. Create Deployment Files
I can help you recreate the deployment configs once you're ready!

---

## 📝 Quick Commands

### Start Everything
```powershell
# Terminal 1 - Backend
cd server; npm run dev

# Terminal 2 - Frontend
cd client; npm run dev
```

### Check MongoDB
```powershell
# Check if MongoDB is running
Get-Service MongoDB
```

### Fresh Start
```powershell
# Stop all servers (Ctrl+C in terminals)
# Clear MongoDB data (optional)
# Restart servers
```

---

## 💡 Tips

1. **Keep MongoDB Compass open** to monitor database changes in real-time
2. **Use browser DevTools** (F12) to debug frontend issues
3. **Check terminal logs** for backend errors
4. **Make small changes** and test frequently
5. **Commit working code** to git before major changes

---

## 🎯 Next Steps

1. ✅ Verify everything runs locally
2. 🎨 Make your CSS and resource changes
3. 🧪 Test all features thoroughly
4. 💾 Commit your changes to git
5. 🚀 Ready to deploy? Let me know!

---

**Need help?** Just ask! I can:
- Help debug any errors
- Guide you through specific changes
- Recreate deployment configs when ready
- Optimize performance or styling
