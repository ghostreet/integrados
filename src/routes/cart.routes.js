import express from 'express';
import cartController from '../controllers/cart.controller.js';

const cartRouter = express.Router();

// Asigna las rutas al controlador correspondiente
cartRouter.post("/", cartController.addCart);
cartRouter.get("/", cartController.getAllCarts);
cartRouter.get("/:id", cartController.getCartById);
cartRouter.post("/:cid/products/:pid", cartController.addProductToCart);
cartRouter.put("/:cid", cartController.updateProductsInCart);
cartRouter.delete("/:cid", cartController.removeAllProductsFromCart);
cartRouter.get("/population/:cid", cartController.getCartAndProducts);

export default cartRouter;