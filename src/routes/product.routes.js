import express from 'express';
import productController from '../controllers/product.controller.js';

const productRouter = express.Router();

// Asigna las rutas al controlador correspondiente
productRouter.put("/:id", productController.updateProduct);
productRouter.get("/:id", productController.getProductById);

productRouter.get("/limit/:limit", productController.getProductsLimit);

productRouter.get("/page/:page", productController.getProductsPage);
productRouter.get("/buscar/qry", productController.getProductByQuery);
productRouter.get("/ordenado/por", productController.getProductsSorted);
productRouter.get("/", productController.getAllProducts);
productRouter.post("/add", productController.addProducts);
productRouter.delete("/:id", productController.deleteProduct);
productRouter.post("/addArray", productController.addProductsFromArray);

export default productRouter;