const Product = require("../models/product.model");

// Créer produit
exports.createProduct = async (data) => {
  const product = new Product(data);
  return await product.save();
};

// Tous les produits
exports.getProducts = async () => {
  return await Product.find();
};

// Produit par ID
exports.getProductById = async (id) => {
  return await Product.findById(id);
};

// Modifier produit
exports.updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

// Supprimer produit
exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};



