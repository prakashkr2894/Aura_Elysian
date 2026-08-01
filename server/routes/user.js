import express from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import { upload, uploadSingleImage } from '../services/uploadService.js';

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, username, mobile, address, email } = req.body;
    const updateData = {};
    if (name !== undefined && name !== '') updateData.name = name;
    if (username !== undefined && username !== '') updateData.username = username;
    if (mobile !== undefined && mobile !== '') updateData.mobile = mobile;
    if (address !== undefined && address !== '') updateData.address = address;
    if (email !== undefined && email !== '') updateData.email = email;
    if (req.file) {
      try {
        const result = await uploadSingleImage(req.file, 'profile-pictures');
        updateData.image = result.secure_url;
      } catch (error) {
        return res.status(500).json({ message: 'Error uploading image' });
      }
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/signup', upload.single('image'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'User with this email already exists' });
    const newUserData = { name, email, password };
    if (req.file) {
      try {
        const result = await uploadSingleImage(req.file, 'profile-pictures');
        newUserData.image = result.secure_url;
      } catch (error) {
        console.error('Image upload failed:', error.message);
        return res.status(500).json({ message: 'Image upload failed: ' + error.message });
      }
    }
    const newUser = new User(newUserData);
    await newUser.save();
    const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET || "test", { expiresIn: "1h" });
    res.status(201).json({ message: 'User created successfully', result: newUser, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
