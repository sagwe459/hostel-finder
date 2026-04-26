// middleware/authMiddleware.js
// Two middleware functions:
//   protect  — verifies JWT and attaches req.user
//   authorize — restricts route to specific roles

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── protect ──────────────────────────────────────────────────────────────────
// Reads the Bearer token from the Authorization header, verifies it,
// fetches the user from the DB (without password), and attaches to req.
const protect = async (req, res, next) => {
  let token;

  // Token is expected in the Authorization header as: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user document (minus password) to the request object
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    next(); // Token valid — continue to route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token is invalid or expired.',
    });
  }
};

// ─── authorize ────────────────────────────────────────────────────────────────
// Role-based access control. Use AFTER protect.
// Example: router.post('/', protect, authorize('landlord'), createListing)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this route.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
