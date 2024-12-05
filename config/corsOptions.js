
const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the origin or no origin (Postman)
    } else {
      callback(new Error("Not allowed by CORS")); // Block other origins
    }
  },
  credentials: true, // Allow cookies and authorization headers if needed
};

module.exports = corsOptions;
