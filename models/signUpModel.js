const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Email verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    required: false
  },
  verificationCodeExpires: {
    type: Date,
    required: false
  },

  // Password reset fields
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpire: {
    type: Date,
    required: false
  }

}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;



// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: [true, 'First name is required'],
//     trim: true,
//     minlength: [2, 'First name must be at least 2 characters'],
//     maxlength: [50, 'First name cannot exceed 50 characters']
//   },
//   lastName: {
//     type: String,
//     required: [true, 'Last name is required'],
//     trim: true,
//     minlength: [2, 'Last name must be at least 2 characters'],
//     maxlength: [50, 'Last name cannot exceed 50 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [
//       /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//       'Please enter a valid email address'
//     ]
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: [6, 'Password must be at least 6 characters']
//   },
//   confirmPassword: {
//     type: String,
//     required: [true, 'Please confirm your password'],
//     validate: {
//       validator: function(value) {
//         return value === this.password;
//       },
//       message: 'Passwords do not match'
//     }
//   },
//   // Email verification fields
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   verificationCode: {
//     type: String,
//     required: false
//   },
//   verificationCodeExpires: {
//     type: Date,
//     required: false
//   }
// }, {
//   timestamps: true
// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;

// // const mongoose = require('mongoose');

// // const userSchema = new mongoose.Schema({

// //     firstName:{
// //     type: String,
// //     required: [true, 'First name is required'],
// //     trim: true,
// //     minlength: [2, 'First name must be at least 2 characters'],
// //     maxlength: [50, 'First name cannot exceed 50 characters']
// //   }, lastName: {
// //     type: String,
// //     required: [true, 'Last name is required'],
// //     trim: true,
// //     minlength: [2, 'Last name must be at least 2 characters'],
// //     maxlength: [50, 'Last name cannot exceed 50 characters']
// //   },  email: {
// //     type: String,
// //     required: [true, 'Email is required'],
// //     unique: true,
// //     lowercase: true,
// //     trim: true,
// //     match: [
// //       /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
// //       'Please enter a valid email address'
// //     ]
// //   }, password: {
// //     type: String,
// //     required: [true, 'Password is required'],
// //     minlength: [6, 'Password must be at least 6 characters']
// //   },
  
// //   confirmPassword: {
// //     type: String,
// //     required: [true, 'Please confirm your password'],
// //     validate: {
// //       validator: function(value) {
// //         return value === this.password;
// //       },
// //       message: 'Passwords do not match'
// //     }
// //   }
// // },  {
// //   timestamps: true // Adds createdAt and updatedAt automatically
// // }
// // )


// // const User = mongoose.model('User', userSchema);


// // module.exports = User;