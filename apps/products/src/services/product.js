import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();

    return {
      status: 201,
      message: "Produit créé avec succès",
      data: saved,
    };
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
