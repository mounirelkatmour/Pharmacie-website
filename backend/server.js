const express = require("express");
const cors = require("cors");
const routes = require("./routes"); // Import routes

const app = express();

// Middleware to handle large payloads
app.use(express.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Adjust the limit as needed

app.use(cors()); // Allow cross-origin requests if needed

// Use routes
app.use("/", routes);

app.listen(8081, () => {
  console.log("Server is listening on port 8081");
});
