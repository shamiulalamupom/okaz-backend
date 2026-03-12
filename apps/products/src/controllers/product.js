import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.js";
import * as productService from "../services/product.service.js";

export const createProduct = async (req, res) => {
  try {
    const data = createProductSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten() });
    }

    const result = await productService.createProduct(data.data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const data = updateProductSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({ error: data.error.flatten() });
    }

    const updated = await productService.updateProduct(req.params.id, data.data);

    if (!updated) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await productService.deleteProduct(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json({ message: "Produit supprimé ✅" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};