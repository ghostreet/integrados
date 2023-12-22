/*import { promises as fs } from "fs";
import ProductsManager from "./ProductManager.js";
import Cart from "../mongo/models/cart.model.js";
import mongoose from "mongoose";
const allProds = new ProductsManager();

class CartManager { 
    constructor (){
        this.cartsModel = mongoose.model('Cart');
    }
    readCarts = async () => {
        let carts = await fs.readFile(this.path, "utf-8");
        return JSON.parse(carts)
    };

    writeCarts = async (cart) => {
        await fs.writeFile(this.path, JSON.stringify(cart));
    };

    exist = async (_id) =>{
        try {
            let cartById = await this.findById(_id);
            return cartById;
        } catch (error) {
            console.error('Error al verificar si el carrito existe:', error);
            return null;
        }
    };

    addCart = async () => {
        try {
          let newCart = new Cart({ products: [] });
          await newCart.save();
          return newCart;  // Devolver el carrito creado
        } catch (error) {
          console.error('Error al agregar un nuevo carrito:', error);
          throw error;
        }
      };

    getCartsId = async (id) => {
        try {
            // Utiliza findById directamente en el modelo
            let cartById = await cartsModel.findById(id).populate('products.productId');
            if (!cartById) return "carrito no registrado";
            return cartById;
          } catch (error) {
            console.error('Error al obtener el carrito por ID:', error);
            return "Error al obtener el carrito por ID";
          }
        };
    /*addProdCart = async (cartId, productId) => {
        try {
            let cartById = await this.cartsModel.findById(cartId);
            if(!cartById) return "carrito no registrado";
            let productById = await allProds.exist(productId);
            if (!productById) return "producto no encontrado";

            if(cartById.products.some((prod) => prod.productId === productId)){
                let addProdInCart = cartById.products.id(productId);
                addProdInCart.quantity++;
                await cartById.save();
                return "producto añadido al carrito"
            }

            cartById.products.push({productId: productById.id, quantity: 1});
            await cartById.save();
            return "Producto agregado al carrito";

        } catch (error) {
            console.error('Error al agregar productos al carrito:', error);
            return "Error al agregar productos al carrito";
        }
    };*/

   /* async addCart(newCart) {
        try {
          const createdCart = await Cart.create(newCart); // Supongo que estás usando un modelo llamado Cart
          return createdCart;
        } catch (error) {
          console.error('Error al crear el carrito:', error);
          throw error; // Propaga el error hacia arriba para manejarlo en el controlador
        }
      }

      async addProdCart(cartId, productId) {
        try {
          // Utiliza this.cartsModel en lugar de cartsModel
          let cartById = await this.cartsModel.findById(cartId);
          if (!cartById) return 'carrito no registrado';
    
          // Utiliza allProds.exist de manera más directa
          console.log('ID del producto:', productId);
          let productById = await allProds.exist(productId);
          if (!productById) return 'producto no encontrado';
    
          if (cartById.products.some((prod) => prod.productId.equals(productId))) {
            let addProdInCart = cartById.products.find((prod) => prod.productId.equals(productId));
            addProdInCart.quantity++;
            await cartById.save();
            return 'producto añadido al carrito';
          }
    
          cartById.products.push({ productId: productById.id, quantity: 1 });
          await cartById.save();
          return 'Producto agregado al carrito';
        } catch (error) {
          console.error('Error al agregar productos al carrito:', error);
          return 'Error al agregar productos al carrito';
        }
      }
    
        //trae los carritos
        async getCarts(){
            try{
                const carts = await cartsModel.find({})
                .populate({
                    path: "products.productId",
                    model: "products",
                    select: "img description price stock"
                });
                return carts;
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


export default CartManager*/
