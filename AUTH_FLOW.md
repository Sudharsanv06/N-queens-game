# 🔐 Authentication Flow Documentation

## Overview

This document explains the JWT-based authentication system implemented for the N-Queens game, including signup, login, token refresh, logout workflows, and security considerations.

---

## 🏗️ Architecture

### **Token System**

We use a **dual-token architecture**:

1. **Access Token** (Short-lived: 7 days)
   - Used for API authentication
   - Sent in `Authorization: Bearer <token>` header
   - Stored in localStorage
   - Contains: `{ id, email, username, name }`

2. **Refresh Token** (Long-lived: 30 days)
   - Used to generate new access tokens
   - Stored in database (User.refreshTokens array)
   - Stored in localStorage
   - Limit: 5 tokens per user (automatic cleanup)

### **Why Dual Tokens?**

- **Security**: Access tokens expire quickly, limiting exposure
- **UX**: Users stay logged in without frequent re-authentication
- **Revocation**: Refresh tokens can be invalidated server-side
- **Device Management**: Track multiple devices (up to 5)

---

## 🔄 Authentication Flows

### **1. Signup Flow**

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │  Server │                  │   DB    │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ POST /api/auth/signup      │                            │
     │ { username, email,         │                            │
     │   password, ... }          │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │ Validate Input             │
     │                            │ (username min 3 chars,     │
     │                            │  email format,             │
     │                            │  password min 6 chars)     │
     │                            │                            │
     │                            │ Check Duplicate Username   │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ Check Duplicate Email      │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ Hash Password (bcrypt)     │
     │                            │ 12 salt rounds             │
     │                            │                            │
     │                            │ Create User                │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ Generate Access Token      │
     │                            │ (7 day expiry)             │
     │                            │                            │
     │                            │ Generate Refresh Token     │
     │                            │ (30 day expiry)            │
     │                            │                            │
     │                            │ Store Refresh Token        │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │ { success: true,           │                            │
     │   token, refreshToken,     │                            │
     │   user: {...} }            │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Store in localStorage:     │                            │
     │ - token                    │                            │
     │ - refreshToken             │                            │
     │ - user                     │                            │
     │                            │                            │
     │ Set axios default header:  │                            │
     │ Authorization: Bearer token│                            │
     │                            │                            │
     │ Navigate to /profile       │                            │
     │                            │                            │
```

**Implementation Details:**

**Client (Redux Thunk):**
```javascript
export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/signup', userData);
      const { token, refreshToken, user } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, refreshToken, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

**Server (Controller):**
```javascript
export const signup = async (req, res) => {
  try {
    const { username, name, email, password, mobile } = req.body;
    
    // Validation
    if (!username || username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be at least 3 characters' 
      });
    }
    
    // Check duplicates
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or username already registered' 
      });
    }
    
    // Create user (password hashed by pre-save hook)
    const user = await User.create({ 
      username, name, email, password, mobile 
    });
    
    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift(); // Keep only 5 most recent
    }
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      refreshToken,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

**Password Hashing (Model Pre-Save Hook):**
```javascript
userSchema.pre('save', async function(next) {
  // Only hash password if modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12); // 12 rounds for security
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
```

---

### **2. Login Flow**

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │  Server │                  │   DB    │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ POST /api/auth/login       │                            │
     │ { email, password }        │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │ Find User by Email         │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ Compare Password           │
     │                            │ (bcrypt.compare)           │
     │                            │                            │
     │                            │ ❌ If invalid:             │
     │                            │    Return 401              │
     │                            │                            │
     │                            │ ✅ If valid:               │
     │                            │    Generate Tokens         │
     │                            │                            │
     │                            │ Update lastLogin           │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │ { token, refreshToken,     │                            │
     │   user }                   │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Store tokens + user        │                            │
     │ Set axios header           │                            │
     │ Navigate to /profile       │                            │
     │                            │                            │
```

**Implementation:**

**Client:**
```javascript
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', { 
        email, 
        password 
      });
      
      const { token, refreshToken, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, refreshToken, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

**Server:**
```javascript
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      success: true,
      token,
      refreshToken,
      user: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

**Password Comparison (Model Method):**
```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

---

### **3. Token Refresh Flow**

When access token expires, automatically refresh without re-login:

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │  Server │                  │   DB    │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ API Request with           │                            │
     │ expired access token       │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │ ⚠️ 401 Unauthorized         │                            │
     │ (Token expired)            │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Detect 401 (axios          │                            │
     │ interceptor)               │                            │
     │                            │                            │
     │ POST /api/auth/refresh     │                            │
     │ { refreshToken }           │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │ Verify Refresh Token       │
     │                            │ (JWT signature + expiry)   │
     │                            │                            │
     │                            │ Find User                  │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ Check if token in          │
     │                            │ user.refreshTokens array   │
     │                            │                            │
     │                            │ ❌ If invalid:             │
     │                            │    Return 401              │
     │                            │    (must re-login)         │
     │                            │                            │
     │                            │ ✅ If valid:               │
     │                            │    Generate New Access     │
     │                            │    Token                   │
     │                            │                            │
     │ { token: "new_token" }     │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Update localStorage        │                            │
     │ Update axios header        │                            │
     │ Retry original request     │                            │
     │                            │                            │
```

**Implementation:**

**Client (Axios Interceptor):**
```javascript
// Setup in Redux auth initialization
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', { 
          refreshToken 
        });
        
        const { token } = response.data;
        
        // Update storage and header
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        // Retry original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Server:**
```javascript
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }
    
    // Verify token
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if token exists in user's array
    if (!user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token not valid' 
      });
    }
    
    // Generate new access token
    const newToken = generateAccessToken(user);
    
    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

---

### **4. Logout Flow**

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │  Server │                  │   DB    │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ POST /api/auth/logout      │                            │
     │ Authorization: Bearer      │                            │
     │ { refreshToken }           │                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │ Verify Access Token        │
     │                            │ (authRequired middleware)  │
     │                            │                            │
     │                            │ Find User                  │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ Remove Refresh Token       │
     │                            │ from user.refreshTokens    │
     │                            │                            │
     │                            │ Save User                  │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │ { success: true }          │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Clear localStorage         │                            │
     │ Remove axios header        │                            │
     │ Navigate to /              │                            │
     │                            │                            │
```

**Implementation:**

**Client:**
```javascript
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      await axios.post('/api/auth/logout', { refreshToken });
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Remove axios header
      delete axios.defaults.headers.common['Authorization'];
      
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

**Server:**
```javascript
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.id; // From authRequired middleware
    
    const user = await User.findById(userId);
    
    if (refreshToken) {
      // Remove specific token
      user.refreshTokens = user.refreshTokens.filter(
        token => token !== refreshToken
      );
    } else {
      // Remove all tokens (logout from all devices)
      user.refreshTokens = [];
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

---

### **5. Protected Route Flow**

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│ Client  │                  │  Server │                  │   DB    │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │ GET /api/user/profile      │                            │
     │ Authorization: Bearer token│                            │
     ├───────────────────────────>│                            │
     │                            │                            │
     │                            │ authRequired Middleware:   │
     │                            │                            │
     │                            │ Extract token from header  │
     │                            │                            │
     │                            │ Verify JWT signature       │
     │                            │ & expiry                   │
     │                            │                            │
     │                            │ ❌ If invalid:             │
     │                            │    Return 401              │
     │                            │                            │
     │                            │ ✅ If valid:               │
     │                            │    Decode payload          │
     │                            │    { id, email, ... }      │
     │                            │                            │
     │                            │ Find User by ID            │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │                            │ Check user.isActive        │
     │                            │                            │
     │                            │ ❌ If inactive:            │
     │                            │    Return 401              │
     │                            │                            │
     │                            │ ✅ If active:              │
     │                            │    Set req.user            │
     │                            │    Call next()             │
     │                            │                            │
     │                            │ Controller executes:       │
     │                            │ Uses req.user.id           │
     │                            │                            │
     │                            │ Fetch profile data         │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │                            │
     │ { user: {...} }            │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
```

**Implementation:**

**Middleware:**
```javascript
export const authRequired = async (req, res, next) => {
  try {
    // Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }
    
    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name
    };
    
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

**Frontend Protected Route:**
```jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

---

## 🔒 Security Considerations

### **1. Password Security**

✅ **bcrypt Hashing**
- 12 salt rounds (recommended for 2024)
- Timing-safe comparison with `bcrypt.compare()`
- Hashing in model pre-save hook (automatic)

❌ **Never Store Plain Passwords**
```javascript
// BAD: Storing password directly
user.password = req.body.password;

// GOOD: Let pre-save hook handle hashing
user.password = req.body.password; // Hashed automatically
```

### **2. JWT Token Security**

✅ **Best Practices Implemented:**
- Short access token expiry (7 days)
- Long refresh token expiry (30 days)
- Tokens stored in localStorage (XSS mitigation via CSP)
- Server-side token validation on every request
- Refresh token rotation (old tokens invalidated)
- Device limit (max 5 refresh tokens)

⚠️ **Potential Improvements:**
- Use httpOnly cookies for tokens (prevents XSS)
- Implement token blacklist for immediate revocation
- Add device fingerprinting
- Implement suspicious activity detection

### **3. Rate Limiting**

✅ **Auth Endpoints Protected:**
```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many auth requests, please try again later'
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
```

### **4. Input Validation**

✅ **Server-Side Validation:**
- Username: Min 3 characters, alphanumeric + underscore
- Email: Regex validation
- Password: Min 6 characters (increase to 8+ recommended)
- Bio: Max 200 characters
- Mobile: Optional, numeric validation

### **5. HTTPS Requirement**

⚠️ **Production Checklist:**
- [ ] Enable HTTPS (Let's Encrypt for free SSL)
- [ ] Set `secure: true` on cookies (if using)
- [ ] Enable HSTS header
- [ ] Use environment variables for JWT_SECRET

### **6. Token Expiry Handling**

✅ **Graceful Degradation:**
- Access token expires → Auto-refresh with refresh token
- Refresh token expires → Redirect to login
- Invalid token → Clear storage and redirect

### **7. Logout Security**

✅ **Proper Cleanup:**
- Server-side token removal from database
- Client-side storage clearing
- Axios header removal
- Optional: Logout from all devices

---

## 🧪 Testing Authentication

### **Test Scenarios**

#### 1. **Signup Flow**
```bash
# Create account
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Expected: 201 with tokens and user object
```

#### 2. **Login Flow**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Expected: 200 with tokens
```

#### 3. **Protected Route Access**
```bash
# Get profile (with token)
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected: 200 with profile data

# Without token
curl -X GET http://localhost:5000/api/user/profile

# Expected: 401 Unauthorized
```

#### 4. **Token Refresh**
```bash
# Refresh access token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'

# Expected: 200 with new access token
```

#### 5. **Logout**
```bash
# Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'

# Expected: 200 with success message
```

---

## 🔑 JWT Token Structure

### **Access Token Payload**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "testuser",
  "name": "Test User",
  "iat": 1701234567,
  "exp": 1701839367
}
```

### **Refresh Token Payload**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "type": "refresh",
  "iat": 1701234567,
  "exp": 1703826567
}
```

### **Token Generation**
```javascript
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};
```

---

## 🛠️ Troubleshooting

### **Issue: "Invalid or expired token"**
**Solution:**
- Check token expiry with jwt.io
- Verify JWT_SECRET is same between generate/verify
- Ensure token format: `Bearer <token>`

### **Issue: "User not found or inactive"**
**Solution:**
- Check user exists in database
- Verify `isActive: true` in User document
- Ensure user ID matches token payload

### **Issue: "Refresh token not valid"**
**Solution:**
- Check refresh token exists in `user.refreshTokens` array
- Verify refresh token hasn't expired
- Ensure logout wasn't called (which clears tokens)

### **Issue: Infinite redirect loop**
**Solution:**
- Check `isAuthenticated` state in Redux
- Verify localStorage has `token` and `user`
- Ensure axios interceptor isn't conflicting

---

## 📚 Related Documentation

- [DAY5_COMPLETE.md](./DAY5_COMPLETE.md) - Full Day 5 implementation overview
- [STATS_AGGREGATION.md](./STATS_AGGREGATION.md) - MongoDB aggregation pipelines

---

**Authentication System Status**: ✅ **PRODUCTION READY**
