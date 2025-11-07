const Product = require("../models/Product.js");

// HQ: create product
const createProduct = async (req, res) => {
  try {
    const { name, unit, description } = req.body;
    if (!name || !unit)
      return res.status(400).json({ message: "Name and unit are required" });

    const existing = await Product.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Product already exists" });

    const product = new Product({ name, unit, description });
    await product.save();

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
};

// HQ: get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

// HQ: update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, description } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name) product.name = name;
    if (unit) product.unit = unit;
    if (description) product.description = description;
    product.updatedAt = Date.now();

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

// HQ: delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.remove();
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
};
