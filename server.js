const express = require("express");
const app = express();
app.use(express.static(__dirname));

// Import routes
const productRoutes = require("./routes/productRoutes");

// Middleware
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("E-commerce API Running 🚀");
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});