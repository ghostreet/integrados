import { Router } from "express";
import ProductDTO from "../dao/DTOs/product.dto.js";
import { productService, userService } from "../repository/index.js";
import Products from "../dao/mongo/products.mongo.js"
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import { generateProductErrorInfo } from "../services/errors/info.js";
import productController from "../controllers/product.controller.js";

const productRouter = Router()



productRouter.post("/", async (req, res) => {
    let { description, image, price, stock, category, availability } = req.body
    
    const product = { description, image, price, stock, category, availability }
    if (!description || !price) {
        try {
            throw CustomError.createError({
                name: 'Error en Creacion de Producto',
                cause: generateProductErrorInfo(product),
                message: 'Error al intentar crear el Producto',
                code: EErrors.REQUIRED_DATA,
            });
        } catch (error) {
            req.logger.error("Error al comparar contraseñas: " + error.message);
            console.error(error);
            return;
        }
    }
    req.logger.info('Se crea producto correctamente');
    let prod = new ProductDTO(product)
    let result = await productService.createProduct(prod)
    res.send({ status: "success", payload: result })
})
    

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


export default productRouter

/*import express from 'express';
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

export default productRouter;*/