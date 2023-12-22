
import CartManager from '../dao/classes/CartManager.js';


const cartManager = new CartManager();

const cartController = {
  addCart: async (req, res) => {
    try {
      const newCart = req.body;
      const result = await cartManager.addCart(newCart);
  
      // Asegúrate de que el resultado sea un objeto y tenga un _id válido
      if (result && result._id) {
        res.json({ message: 'Nuevo carrito agregado', cartId: result._id });
      } else {
        console.error('Error al agregar carrito: El nuevo carrito no tiene un ID válido.');
        res.status(500).json({ error: 'Error interno del servidor al agregar carritos' });
      }
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
  addProductToCart: async (req, res) => {
    try {
      let cartId = req.params.cid;
      let prodId = req.params.pid;
      const result = await cartManager.addProdCart(cartId, prodId);
      
      // Agregar un console.log para verificar la respuesta
      console.log('Resultado del añadido al carrito:', result);
  
      res.json(result);
    } catch (error) {
      console.error('Error al agregar productos al carrito:', error);
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
  
 getCartAndProducts: async (req, res)=> {
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
