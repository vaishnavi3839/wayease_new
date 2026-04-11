const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_wayease';

// ⚠️ In-memory OTP store (use Redis in production)
const otpMap = new Map();

// ================= AUTH MIDDLEWARE =================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // FIX: safer token extraction
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Access denied. No token provided.' });

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// ================= SIGNUP =================
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const normalizedEmail = email.toLowerCase().trim();

    const existing = db.get('users').find({ email: normalizedEmail }).value();
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    db.get('users').push(newUser).write();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Account created successfully!',
      token,
      fullName: newUser.fullName,
      email: newUser.email
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const normalizedEmail = email.toLowerCase().trim();

    const user = db.get('users').find({ email: normalizedEmail }).value();
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Logged in successfully!',
      token,
      fullName: user.fullName,
      email: user.email
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ================= SEND OTP =================
router.post('/auth/otp/send', (req, res) => {
  const raw = String(req.body.phone || '').replace(/\D/g, '');

  if (raw.length !== 10)
    return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number.' });

  const code = String(Math.floor(100000 + Math.random() * 900000));

  otpMap.set(raw, {
    code,
    exp: Date.now() + 10 * 60 * 1000
  });

  console.log(`[WayEase OTP] +91${raw} → ${code}`);

  const payload = {
    ok: true,
    message: 'OTP sent (demo — check server log).'
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.demoOtp = code; // ⚠️ remove in prod
  }

  res.json(payload);
});

// ================= VERIFY OTP =================
router.post('/auth/otp/verify', async (req, res) => {
  try {
    const raw = String(req.body.phone || '').replace(/\D/g, '');
    const code = String(req.body.code || '').trim();

    const row = otpMap.get(raw);

    if (!row || row.code !== code || Date.now() > row.exp)
      return res.status(400).json({ error: 'Invalid or expired OTP.' });

    otpMap.delete(raw);

    const phoneEmail = `${raw}@phone.wayease.local`;

    let user = db.get('users').find({ email: phoneEmail }).value();

    if (!user) {
      user = {
        id: uuidv4(),
        fullName: `Traveler ···${raw.slice(-4)}`,
        email: phoneEmail,
        phone: raw,
        password: await bcrypt.hash(uuidv4(), 10),
        createdAt: new Date().toISOString()
      };

      db.get('users').push(user).write();
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Logged in with mobile!',
      token,
      fullName: user.fullName,
      email: user.email
    });

  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ================= GOOGLE DEMO =================
router.post('/auth/google-demo', async (req, res) => {
  try {
    const email = 'explorer.google@wayease.demo';

    let user = db.get('users').find({ email }).value();

    if (!user) {
      user = {
        id: uuidv4(),
        fullName: 'Google Explorer',
        email,
        password: await bcrypt.hash(uuidv4(), 10),
        createdAt: new Date().toISOString()
      };

      db.get('users').push(user).write();
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Signed in with Google (demo account).',
      token,
      fullName: user.fullName,
      email: user.email
    });

  } catch (err) {
    console.error('Google demo error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ================= GET PROFILE =================
router.get('/me', authenticateToken, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();

  if (!user)
    return res.status(404).json({ error: 'User not found.' });

  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
    preferences: user.preferences || {}
  });
});

// ================= UPDATE PROFILE =================
router.patch('/me', authenticateToken, (req, res) => {
  const { fullName, preferences } = req.body;

  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user)
    return res.status(404).json({ error: 'User not found.' });

  const updates = {};

  if (typeof fullName === 'string' && fullName.trim()) {
    updates.fullName = fullName.trim();
  }

  if (preferences && typeof preferences === 'object' && !Array.isArray(preferences)) {
    updates.preferences = { ...(user.preferences || {}), ...preferences };
  }

  if (Object.keys(updates).length) {
    db.get('users').find({ id: req.user.id }).assign(updates).write();
  }

  const updatedUser = db.get('users').find({ id: req.user.id }).value();

  res.json({
    id: updatedUser.id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    preferences: updatedUser.preferences || {}
  });
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    let user = db.get('users').find({ email }).value();

    if (!user) {
      user = {
        id: uuidv4(),
        fullName: name,
        email,
        password: await bcrypt.hash(uuidv4(), 10),
        createdAt: new Date().toISOString()
      };
      db.get('users').push(user).write();
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      fullName: user.fullName
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google auth failed" });
  }
});
module.exports = { router, authenticateToken };