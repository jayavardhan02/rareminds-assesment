const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/auth');

const signup = async (req, res) => {
  try {
    console.log('[SIGNUP] Attempting to create user with email:', req.body.email);
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      console.log('[SIGNUP] Validation failed: Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('[SIGNUP] Checking if user already exists');
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      console.log('[SIGNUP] User already exists:', existingUser.email);
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('[SIGNUP] Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[SIGNUP] Creating user in database');
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    console.log('[SIGNUP] User created successfully:', user._id);
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('[SIGNUP ERROR]', error.message);
    console.error('[SIGNUP ERROR STACK]', error.stack);
    res.status(500).json({ error: 'Error creating user', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log('[LOGIN] Attempting login for email:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[LOGIN] Validation failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('[LOGIN] Finding user in database');
    const user = await User.findOne({ email });

    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[LOGIN] Comparing password for user:', user._id);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('[LOGIN] Invalid password for user:', user._id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[LOGIN] Password valid, generating token');
    const token = generateToken(user._id, user.role);

    console.log('[LOGIN] Login successful for user:', user._id);
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error.message);
    console.error('[LOGIN ERROR STACK]', error.stack);
    res.status(500).json({ error: 'Error logging in', details: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    console.log('[GET USERS] Fetching all users');
    console.log('[GET USERS] Request from user:', req.user?._id, req.user?.role);
    const users = await User.find({}, '_id username email role');
    console.log('[GET USERS] Raw users from DB:', users);
    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }));
    console.log('[GET USERS] Found', formattedUsers.length, 'users');
    console.log('[GET USERS] Formatted users:', formattedUsers);
    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('[GET USERS ERROR]', error.message);
    console.error('[GET USERS ERROR STACK]', error.stack);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

module.exports = { signup, login, getUsers };
