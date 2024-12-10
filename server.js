const express = require("express");
const serverless = require("serverless-http");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
// const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const PORT = process.env.PORT || 3500;
require("dotenv").config();

// Connect to MongoDB
connectDB();

// custom middleware logger
// app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// // Cross Origin Resource Sharing
app.use(cors(corsOptions));



// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/api", express.static(path.join(__dirname, "/public")));

// routes
app.use("/api", require("./routes/root"));
app.use("/api/register", require("./routes/register"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/refresh", require("./routes/refresh"));
app.use("/api/logout", require("./routes/logout"));
app.use("/api/createunit", require("./routes/api/createunit"));
app.use("/api/updateUnit", require("./routes/updateUnit"));
app.use("/api/unit", require("./routes/unit"));
app.use("/api/verification", require("./routes/apiverification"));
app.use("/api/entverification", require("./routes/viewverification"));
app.use("/api/userverification", require("./routes/userverification"));
app.use("/api/payment", require("./routes/api/payment"));
app.use("/api/create-payment-intent", require("./routes/api/createpayment"));
app.use("/api/resetPassword", require("./routes/api/sendPassword"));
app.use("/api/guestvnin", require("./routes/api/guest"));
app.use("/api/send-email", require("./routes/api/sendEmail"));

app.use(verifyJWT);
app.use("/api/employees", require("./routes/api/employees"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/newunit", require("./routes/api/updateunit"));
app.use("/api/useunit", require("./routes/useunit"));
app.use("/api/verify", require("./routes/api/verification"));
app.use("/api/userscount", require("./routes/api/userscount"));
app.use("/api/allverification", require("./routes/allverification"));
app.use("/api/changePassword", require("./routes/api/changePassword"));
app.use("/api/fetchuser", require("./routes/api/fetchuser"));
app.use("/api/createEntUser", require("./routes/api/createEntUser"));
app.use("/api/createUser", require("./routes/api/createUser"));
app.use("/api/updateenable", require("./routes/api/updateenable"));

app.use(
  "/api/getverificationemail",
  require("./routes/api/getverificationemail")
);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
