import { Router } from "express";
//import { Carts } from '../dao/factory.js'
import CartDTO from "../dao/DTOs/cart.dto.js";
import TicketDTO from "../dao/DTOs/ticket.dto.js";
import { ticketService, cartService } from "../repository/index.js";
import Carts from "../dao/mongo/carts.mongo.js";

const cartRouter = Router();
const cartMongo = new Carts()

// Asigna las rutas al controlador correspondiente
cartRouter.get("/", async (req, res) => {
    try
    {
        let result = await cartMongo.get()
        res.status(200).send({ status: "success", payload: result });
    }
    catch(error)
    {
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    } 
})

cartRouter.post("/", async (req, res) => {
    try
    {
        let { products } = req.body
        let cart = new CartDTO({ products })
        let result = await cartService.createCart(cart)
        res.status(200).send({ status: "success", payload: result });
    }
    catch(error)
    {
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }
})



cartRouter.post("/:cid/purchase", async (req, res) => {
    try {
        let id_cart = req.params.cid;

        const productos = req.body.productos;
        const correo = req.body.correo;
        let cart = cartService.validateCart(id_cart)
        if (!cart) {
            
            req.logger.error("No se encontró el carrito con el ID proporcionado");
            return { error: "No se encontró el carrito con el ID proporcionado" };
        }
        let validaStock = cartService.validateStock({productos})

        if (validaStock) {
            let totalAmount = await cartService.getAmount({productos})
            const ticketFormat = new TicketDTO({amount:totalAmount, purchaser:correo});
            const result = await ticketService.createTicket(ticketFormat);
        } else {
            req.logger.error("No hay suficiente stock para realizar la compra");
        }
    } catch (error) {
        req.logger.error("Error al procesar la compra:" + error.message);
        console.error("Error al procesar la compra:", error);
        return res.status(500).json({ error: "Error interno al procesar la compra" });
    }
})

/*cartRouter.post("/addcart", cartController.addCart);
cartRouter.post("/addproducttocart/:cid", cartController.addProductToCart)
cartRouter.get("/allcarts", cartController.getAllCarts);
cartRouter.get("/:cid/products/:pid", cartController.addProductToCart);
cartRouter.put("/:cid", cartController.updateProductCart);
cartRouter.delete("/:cid", cartController.removeAllProductsFromCart);
cartRouter.get("/population/:cid", cartController.getCartAndProducts);*/

export default cartRouter;