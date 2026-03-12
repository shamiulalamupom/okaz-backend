import * as productService from "../services/product.service.js";
import { createProductSchema, updateProductSchema } from "../schemas/product.js";


// Créer un produit
export const createProduct = async (req, res) => {
  try {

    // Validation des données
    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validation.error.errors
      });
    }

    // Création du produit
    const product = await productService.createProduct(validation.data);

    // Réponse
    return res.status(201).json({
      message: "Produit créé avec succès",
      data: product
    });

  } catch (error) {
    // Log de l'erreur côté serveur
    console.error("Erreur createProduct:", error);

    // Réponse en cas d'erreur serveur
    return res.status(500).json({
      message: "Erreur serveur lors de la création du produit"
    });
  }
};



// Tous les produits
export const getProducts = async (req, res) => {
  try {

    // Récupération des produits
    const products = await productService.getProducts();

    // Réponse
    return res.status(200).json({
      count: products.length,
      data: products
    });

  } catch (error) {
    // Log de l'erreur côté serveur
    console.error("Erreur getProducts:", error);

    // Réponse en cas d'erreur serveur
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération des produits"
    });
  }
};



// Produit par ID
export const getProductById = async (req, res) => {
  try {

    // Récupération de l'id
    const { id } = req.params;

    // Recherche du produit
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Produit introuvable"
      });
    }

    // Réponse
    return res.status(200).json({
      data: product
    });

  } catch (error) {
    // Log de l'erreur côté serveur
    console.error("Erreur getProductById:", error);

    // Réponse en cas d'erreur serveur
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération du produit"
    });
  }
};



// Modifier un produit
export const updateProduct = async (req, res) => {
  try {

    // Récupération de l'id
    const { id } = req.params;

    // Validation des données
    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validation.error.errors
      });
    }

    // Mise à jour du produit
    const updatedProduct = await productService.updateProduct(
      id,
      validation.data
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Produit introuvable"
      });
    }

    // Réponse
    return res.status(200).json({
      message: "Produit mis à jour",
      data: updatedProduct
    });

  } catch (error) {
    // Log de l'erreur côté serveur
    console.error("Erreur updateProduct:", error);

    // Réponse en cas d'erreur serveur
    return res.status(500).json({
      message: "Erreur serveur lors de la mise à jour"
    });
  }
};



// Supprimer un produit
export const deleteProduct = async (req, res) => {
  try {

    // Récupération de l'id
    const { id } = req.params;

    // Suppression du produit
    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Produit introuvable"
      });
    }

    // Réponse
    return res.status(200).json({
      message: "Produit supprimé avec succès"
    });

  } catch (error) {
    // Log de l'erreur côté serveur
    console.error("Erreur deleteProduct:", error);

    // Réponse en cas d'erreur serveur
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression"
    });
  }
};