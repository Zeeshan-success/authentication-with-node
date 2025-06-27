const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
require("dotenv").config();
const loginRouter = require("./routes/Routes");
const app = express();
const server = http.createServer(app);
const { ConnectDatabase } = require("./connection");
const port = process.env.PORT || 8080;
const session = require("express-session");
const passport = require("passport");
const jwt = require('jsonwebtoken'); // Add this for JWT tokens
const { producer } = require('./kafka');
const saveMessagesToDB = require("./saveMessagesToDB");
const Chat = require("./models/Chat");


require("./auth/passport"); // import passport config
ConnectDatabase(); // Connect to the database

// Initialize Socket.IO with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({ 
    secret: process.env.SESSION_SECRET || "yourSecret", 
    resave: false, 
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/", loginRouter);

// Route to start Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Updated callback route with proper token handling
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { 
          userId: req.user._id, 
          email: req.user.email 
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.CLIENT_ORIGIN || "http://localhost:3000";
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&success=true`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }
);

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect("/");
  });
});

// Optional: API endpoint to get user info
app.get("/api/user", (req, res) => {
  if (req.user) {
    res.json({
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        isVerified: req.user.isVerified
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('🔗 New client connected:', socket.id);

  const userId = socket.handshake.query.userId || socket.id; // Ideally, pass userId from frontend

  await producer.connect();

  socket.on('message', async (data) => {
    const userMessage = {
      message: data.message,
      timestamp: new Date().toISOString(),
      sender: "user",
    };

    // Send message to Kafka
    await producer.send({
      topic: `chat-${userId}`,
      messages: [
        { key: userId, value: JSON.stringify(userMessage) }
      ],
    });

    // Optional: Simulate bot response
    const botMessage = {
      message: `Echo: ${data.message}`,
      timestamp: new Date().toISOString(),
      sender: "bot",
    };

    await producer.send({
      topic: `chat-${userId}`,
      messages: [
        { key: userId, value: JSON.stringify(botMessage) }
      ],
    });

    socket.emit('message', botMessage);
  });

  socket.on('load-history', async () => {
    const history = await Chat.findOne({ userId }).sort({ savedAt: -1 }).lean();
    if (history?.messages) {
      socket.emit('chat-history', history.messages);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`❌ Client disconnected: ${userId}`);
    await saveMessagesToDB(userId);
  });

  socket.emit('message', {
    message: 'Welcome to KellyBot! Let’s begin.',
    timestamp: new Date().toISOString(),
    sender: 'bot',
  });
});
// io.on('connection', (socket) => {
//   console.log('🔗 New client connected:', socket.id);

//   socket.on('message', (data) => {
//     console.log('📩 Message received from frontend:', data);
    
//     const response = {
//       type: 'message',
//       message: `Hello! I received your message: "${data.message}". How can I help you further?`,
//       timestamp: new Date().toISOString(),
//       botId: 'kellybot'
//     };
    
//     socket.emit('message', response);
//     console.log('📤 Response sent to frontend:', response.message);
//   });

//   socket.on('disconnect', () => {
//     console.log('❌ Client disconnected:', socket.id);
//   });

//   socket.on('error', (error) => {
//     console.error('🚨 Socket error:', error);
//   });

//   socket.emit('message', {
//     type: 'message',
//     message: 'Welcome to KellyBot! I\'m here to guide you through rituals, rhythm and renewal. How can I support you?',
//     timestamp: new Date().toISOString(),
//     botId: 'kellybot'
//   });
// });

server.listen(port, () =>
  console.log(`🚀 Server is running on http://localhost:${port}`)
);


// const express = require("express");
// const cors = require("cors");
// const socketIo = require("socket.io");
// const http = require("http");
// require("dotenv").config();
// const loginRouter = require("./routes/Routes");
// const app = express();
// const server = http.createServer(app);
// const { ConnectDatabase } = require("./connection");
// const port = process.env.PORT || 8080;
// const session = require("express-session");
// const passport = require("passport");

// // const Message = require("./models/Message");
// require("./auth/passport"); // import passport config
// ConnectDatabase(); // Connect to the database

// // Initialize Socket.IO with CORS configuration
// const io = socketIo(server, {
//   cors: {
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:3000", // Frontend origin
//     credentials: true, // ✅ allow cookies
//   })
// );
// app.use(express.json()); // Add this for JSON parsing
// app.use(
//   session({ secret: "yourSecret", resave: false, saveUninitialized: false })
// );
// app.use(passport.initialize());
// app.use(passport.session());
// app.use("/", loginRouter);

// // Route to start Google OAuth
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Callback route
// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login",
//     successRedirect: "/", // or your own frontend route
//   })
// );

// // Logout route
// app.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect("/");
// });

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   console.log('🔗 New client connected:', socket.id);

//   // Listen for messages from frontend
//   socket.on('message', (data) => {
//     console.log('📩 Message received from frontend:', data);
    
//     // Process the message here if needed
//     // You can add your chatbot logic here
    
//     // Send back a response (hello message as requested)
//     const response = {
//       type: 'message',
//       message: `Hello! I received your message: "${data.message}". How can I help you further?`,
//       timestamp: new Date().toISOString(),
//       botId: 'kellybot'
//     };
    
//     // Send response back to the client
//     socket.emit('message', response);
//     console.log('📤 Response sent to frontend:', response.message);
//   });

//   // Handle client disconnect
//   socket.on('disconnect', () => {
//     console.log('❌ Client disconnected:', socket.id);
//   });

//   // Handle connection errors
//   socket.on('error', (error) => {
//     console.error('🚨 Socket error:', error);
//   });

//   // Optional: Send welcome message when user connects
//   socket.emit('message', {
//     type: 'message',
//     message: 'Welcome to KellyBot! I\'m here to guide you through rituals, rhythm and renewal. How can I support you?',
//     timestamp: new Date().toISOString(),
//     botId: 'kellybot'
//   });
// });

// // Use server.listen instead of app.listen for Socket.IO
// server.listen(port, () =>
//   console.log(`🚀 Server is running on http://localhost:${port}`)
// );

// const express = require("express");
// const cors = require("cors");
// const socketIo = require("socket.io");
// const http = require("http");
// require("dotenv").config();
// const loginRouter = require("./routes/Routes");
// const app = express();
// const server = http.createServer(app);
// const { ConnectDatabase } = require("./connection");
// const port = process.env.PORT || 8080;
// const session = require("express-session");
// const passport = require("passport");

// // const Message = require("./models/Message");
// require("./auth/passport"); // import passport config
// ConnectDatabase(); // Connect to the database
// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:3000", // Frontend origin
//     credentials: true, // ✅ allow cookies
//   })
// );
// app.use(express.json()); // Add this for JSON parsing
// app.use(
//   session({ secret: "yourSecret", resave: false, saveUninitialized: false })
// );
// app.use(passport.initialize());
// app.use(passport.session());
// app.use("/", loginRouter);

// // Route to start Google OAuth
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Callback route
// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login",
//     successRedirect: "/", // or your own frontend route
//   })
// );

// // Logout route
// app.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect("/");
// });

// app.listen(port, () =>
//   console.log(`Server is running on http://localhost:${port}`)
// );
