const bcrypt = require('bcrypt');
const User = require('../models/signUpModel'); // Assuming you have a User model defined

const handleResetPassword = async (req, res) => {
  const { token,password } = req.body;
  

  const user = await User.findOne({
    resetPasswordToken: token,
    // resetToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log('User found:', user);

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password updated successfully' });
};
module.exports = { handleResetPassword };