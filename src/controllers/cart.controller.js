
import CartManager from '../dao/classes/CartManager.js';


const cartManager = new CartManager();

 const cartController = {
  addCart: async (req, res) => {
    try {
      const newCart = req.body;
      const result = await cartManager.addCarts(newCart);
      res.json({ message: result });
    } catch (error) {
      console.error('Error al agregar carrito:', error);
      res.status(500).json({ error: 'Error interno del servidor al agregar carritos' });
    }
  },
  
  getAllCarts:  async (req, res) => {
    try {
      const allCarts = await cartManager.getCarts();
      res.json(allCarts);
    } catch (error) {
      console.error('Error al obtener carritos:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener los carritos' });
    }
  },
getCartById: async (req, res)=>{
      try {
      let cartId = req.params.cid;
      let prodId = req.params.pid;
      res.send(await carts.addProdCart(cartId, prodId))
      } catch (error){
          console.error('Error al obtener carritos:', error);
      res.status(500).json({ error: 'Error interno del servidor al agregar productos al carrito' });
      }
      
  },
  
updateProductCart: async (req, res)=>{
      try {
      let cartId = req.params.cid;
      let newProds = req.body;
      res.send(await carts.updateProductsInCart(cartId, newProds))
      }catch (error){
          console.error('Error al obtener carritos:', error);
      res.status(500).json({ error: 'Error interno del servidor al actualizar los productos del carrito' });
      }
      
  },
  
  removeAllProductsFromCart: async (req, res) =>{
      try{
      let cartId = req.params.cid;
      res.send(await carts.removeAllProd((cartId)))
      }catch (error){
          console.error('Error al obtener carritos:', error);
      res.status(500).json({ error: 'Error interno del servidor al intentar borrar los productos del carrito' });
  
      }
      
  },
  
 GetCartAndProducts: async (req, res)=> {
      try {
      let cartId = req.params.cid;
      res.send(await carts.getCarts((cartId)))
  
      }catch (error){
          console.error('Error al obtener carritos:', error);
      res.status(500).json({ error: 'Error interno del servidor al intentar obtener el carrito' });
          
      }
      
  },
 }




export default cartController;
