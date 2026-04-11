const express = require("express");
const router = express.Router();

// Import controller
const { getProducts } = require("../controllers/productController");

// Route
router.get("/", getProducts);

module.exports = router;