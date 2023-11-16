import { promises as fs } from "fs";
import { nanoid } from "nanoid";
import ProductsManager from "./ProductManager.js";
import { cartsModel } from "../models/cart.model.js";

const allProds = new ProductsManager;

class CartManager extends cartsModel {
        constructor(){
            super();
        };

    readCarts = async () => {
        let carts = await fs.readFile(this.path, "utf-8");
        return JSON.parse(carts)
    };

    writeCarts = async (cart) => {
        await fs.writeFile(this.path, JSON.stringify(cart));
    };

    exist = async (id) =>{
        let carts = await this.readCart();
        return carts.find(cart => cart.id === id);
    };

    addCarts = async () => {
        let pastCarts = await this.readCart();
        let id = nanoid()
        let cartsCont = [{ id: id, products : []}, ...pastCarts]
        await this.writeCarts(cartsCont)
        return "Nuevo carrito agregado"
    };

    getCartsId = async (id) => {
        let cartById = await this.exist(id)
        if(!cartById) return "carrito no registrado"
        return cartById;
    };

    addProdCart = async (cartId, productId) => {
        let cartById = await this.exist(cartId)
        if(!cartById) return "carrito no registrado";
        let productById = await allProds.exist(productId)
        if(!productById) return "producto no encontrado";

        let allCarts = await this.readCarts();
        let cartFilter = allCarts.filter(cart => cart.id != cartId)

        if(cartById.products.some((prod) => prod.id === productId)){
            let addProdInCart = cartById.products.find(prod => prod.id === productId)
            addProdInCart.quantity++;
            let cartsCont = [cartById, ...cartFilter]
            await this.writeCarts(cartsCont)
            return "producto añadido al carrito"
        }

        cartbyId.products.push({id:productById.id, quantity: 1})
        let cartsCont = [cartById, ...cartFilter]
        await this.writeCarts(cartsCont)
        return "Producto agregado al carrito";

        }

        //trae los carritos
    async getCarts(){
        try{

            const carts = await CartManager.find({})
            .populate({
                path: "products.productId",
                model: "products",
                select: "img description price stock"
            });
        }catch (error){
            console.error('error al obtener los carritos', error);
            return [];
        }
    }
    
    //quita un producto en especifico
    async removeProdCart (cartId, prodId) {
        try{
            const cart = await cartsModel.findById(cartId);
            if(!cart) {
                return  'Carrito no encontrado'
            }
            const productIndx = cart.products.findIndex((products)=> products.productId == prodId)
            
            if (productIndx !== -1){
                cart.products.splice(productIndx, 1);
                await cart.save();
                return 'Producto no encontrado en el carrito'
            }
        }catch (error) {
            console.error('Error al eliminar el producto del carrtio', error);
            return 'Error al eliminar el producto del carrito'
        }
    }
//reemplaza todos los productos
    async upProdCart (cartId, newProduct){
        try {
            const cart = await cartsModel.findById(cartId);
            if(!cart){
                return 'Carrito no encontrado'
            }
            cart.products = newProduct;

            await cart.save();
            return 'Carrito actualizado correctamente'
        }catch (error) {
            console.error('error al actualizar el carrito', error)
            return ' error al actualizar carrito'
        }
    }

    //selecciona y modifica un producto en especifico 
    async updateProductsInCart (cartId, prodId, updatedProduct){
        try {
            const cart = await cartsModel.findById(cartId);
            if(!cart) {
                return 'carrito no encontrado';
            }

            const productToUpdate = cart.products.find((product)=> product.productId === prodId);

            if (!productToUpdate) {
                return 'producto no encontrado en el carrito' 
            }

            Object.assign(productToUpdate, updatedProduct);

            await cart.save();
            return 'Producto actualizado en el carrito';
        } catch (error) {
            console.error ('Error al actualizar el carrito ', error);
            return 'Error al actualizar el carrito ';

        }
    }

    //vaciar carrito
    async removeAllProd (cartId){
        try {
            const cart = await cartsModel.findById(cartId)

            if(!cart) {
                return 'carrito no encontrado'
            }
            cart.products = [];
            await cart.save();

            return 'Todos los productos se han eliminado correctamente'
        }catch (error) {
            console.error ('Error al actualizar el carro', error);
            return 'error al actualizar el carrito'
        }
    }

    //trae la info de un carrito en especifico
    async cartAndProd (cartId) {
        try {
            const cart = await cartsModel.findById(cartId).populate('products.productId').lean();

            if(!cart) {
                return 'carrito no encontrado'
            }
            return cart;
        }catch (error){
            console.error ('error al obtener la info del carrito')
            return 'Error al obtener la info del carrito'
        }
    }



    }


export default CartManager
