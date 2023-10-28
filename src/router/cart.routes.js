import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const CartRouter = Router()
const carts = new CartManager

CartRouter.post("/", async (req, res)=> {
    let newCart = req.body
    res.send(await carts.addCarts(newCart));
});

CartRouter.get("/", async (req, res)=>{
    res.send(await carts.getCarts())
});

CartRouter.get("/:id", async (req, res)=> {
    res.send(await carts.getCartsId(req.params.id))
});

CartRouter.post("/:cid/products/:pid", async (req, res)=>{
    let cartId = req.params.cid;
    let prodId = req.params.pid;
    res.send(await carts.addProdCart(cartId, prodId))
});

CartRouter.put("/:cid", async (req, res)=>{
    let cartId = req.params.cid;
    let newProds = req.body;
    res.send(await carts.updateProductsInCart(cartId, newProds))
});

CartRouter.delete("/:cid", async (req, res) =>{
    let cartId = req.params.cid;
    res.send(await carts.removeAllProd((cartId)))
});

CartRouter.get("/population/:cid", async (req, res)=> {
    let cartId = req.params.cid;
    res.send(await carts.getCarts((cartId)))
});

export default CartRouter