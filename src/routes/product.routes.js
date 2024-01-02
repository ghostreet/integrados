import { Router } from "express";

import ProductDTO from "../dao/DTOs/product.dto.js";
import { productService } from "../repository/index.js";
import Products from "../dao/mongo/products.mongo.js"


import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import { generateProductErrorInfo } from "../services/errors/info.js";



const productRouter = Router()
const productMongo = new Products()

productRouter.get("/", async (req, res) => {
  try
  {
      let result = await productMongo.get()
      res.render('product', { products: result });
  } 
  catch (error) 
  {
      res.status(500).send({ status: "error", message: "Error interno del servidor" });
  }
  
})

productRouter.get("/:id", async (req, res) => {
  try {
    const product = await productMongo.getProductById(req.params.id);
    console.log(product);
    if (product) {
      res.render('detail', { product: product.toObject() });
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Error del servidor');
  }
});

productRouter.post("/", async (req, res) => {
    let { description, image, price, stock, category, availability } = req.body
    
    const product = { description, image, price, stock, category, availability }
    if (!description || !price) {
        return next(CustomError.createError({
            name: 'Error en Creacion de Producto',
            cause: generateProductErrorInfo(product),
            message: 'Error al intentar crear el Producto',
            code: EErrors.REQUIRED_DATA,
        }));
    }
    req.logger.info('Se crea producto correctamente');
    let prod = new ProductDTO(product)
    let result = await productService.createProduct(prod)
    res.send({ status: "success", payload: result })
})
    
productRouter.post("/", async (req, res) => {
  try
  {
      let { description, image, price, stock, category, availability } = req.body
      let prod = new ProductDTO({ description, image, price, stock, category, availability })
      let result = await productService.createProduct(prod)
      res.status(200).send({ status: "success", payload: result });
  }
  catch (error)
  {
      res.status(500).send({ status: "error", message: "Error interno del servidor" });
  }
  
})

productRouter.delete('/products/:id', async (req, res) => {
    try {
        const result = await productManager.deleteProduct(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

//productRouter.post("/addArray", productController.addProductsFromArray);


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