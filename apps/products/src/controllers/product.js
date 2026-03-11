import { createProductSchema } from "../schemas/product";
import { createProduct } from "../services/product";

// Créer produit
exports.createProduct = async (req, res) => {
  try {
    const data = createProductSchema.safeParse(req.body);

    if (!data.success) {
      return res.status(400).json({ error: data.error.message });
    }

    const { status, message, result } = await createProduct(
      req,
      res,
      data.data,
    );

    res.status(status).json({ message, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tous les produits
exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Produit par ID
exports.getProductById = async (req, res) => {
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

// Modifier produit
exports.updateProduct = async (req, res) => {
  try {
    const errors = validateProductData(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const updated = await productService.updateProduct(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer produit
exports.deleteProduct = async (req, res) => {
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
