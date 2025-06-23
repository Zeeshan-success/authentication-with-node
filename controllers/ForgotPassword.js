// controllers/authController.js
const crypto = require('crypto');
const User = require('../models/signUpModel');
const sendEmail = require('../utils/resetPassword');

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(32).toString('hex');

  // ✅ Use exact schema field names
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 1000 * 60 * 15; // 15 minutes

  await user.save();

  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
  await sendEmail(email, 'Password Reset', `Click to reset: ${resetLink}`);

  res.json({ message: 'Reset link sent to email' });
};


module.exports = { handleForgotPassword };