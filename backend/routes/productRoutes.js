const express = require("express");
const { verifyHQ } = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

// HQ: product management
router.post("/", verifyHQ, createProduct);
router.get("/", verifyHQ, getProducts);
router.patch("/:id", verifyHQ, updateProduct);
router.delete("/:id", verifyHQ, deleteProduct);

module.exports = router;
