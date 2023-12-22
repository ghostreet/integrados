
import Products from '../dao/mongo/products.mongo.js';


const productManager = new Products();

const productController ={
    
    updateProduct: async (req, res) => {
        try {
          const id = req.params.id;
          const updateProducts = req.body;
          const result = await productManager.updateProducts(id, updateProducts);
          res.json({ message: result });
        } catch (error) {
          console.error('Error al actualizar producto:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      },
      
      getProductById: async (req, res) => {
        try {
          const pid = req.params.id;
          const productDetail = await productManager.getProdId(pid);
      
          if (productDetail) {
           res.render("detail",{
            title: "Detalles del producto",
            product: productDetail,
           })
          } else {
            res.status(404).json({ error: 'Producto no encontrado' });
          }
        } catch (error) {
          console.error('Error al obtener el producto:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      },
      
      getProductsLimit: async (req, res) => {
        try {
          let limit = parseInt(req.params.limit);
          if (isNaN(limit) || limit <= 0) {
            limit = 10;
          }
      
          // Lógica para obtener productos limitados, ajusta esto según se necesite
          const limitedProducts = await productManager.getProductsLimit(limit);
      
          res.json(limitedProducts);
        } catch (error) {
          console.error('Error al obtener productos limitados:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      },
      
      getProductsPage: async (req, res)=> {
          let page = parseInt(req.params.page);
          if (isNaN(page) || page <= 0) {
              page = 1;
          }
      
          const productPage = 1;
          res.send(await product.getProdPage(page, productPage))
      },
      
      getProductByQuery: async (req, res) => {
          const qry = req.query.q
          res.send(await product.getProdQuery(qry))
      },
      
      getProductsSorted: async(req,res) => {
          let sortOrder = 0;
          if(req.query.por) {
              if(req.query.por === "down") {
                  sortOrder = -1;
              }
          }
          res.send(await product.getProdSort(sortOrder))
      },
      
      getAllProducts: async(req, res) => {
          let sortOrder = req.query.sortOrder;
          let category = req.query.category
          let availability = req.query.availability
      
          if(sortOrder === undefined){
              category = ""
          }
          if(availability === undefined){
              availability = ""
          }
          res.send(await product.getProdGeneral(null, null, category,availability,sortOrder))
      },
      
      addProducts: async (req, res)=> {
          let newProduct = req.body;
      
          if(
              !newProduct.img  ||
              !newProduct.name||
              !newProduct.description ||
              !newProduct.price ||
              !newProduct.stock ||
              !newProduct.category ||
              !newProduct.availability
          ) {
              return res.status(400).json({ error: 'Campos faltantes por proporcionar'});
          }
          res.send(await product.addProducts(newProduct));
      },
      
      deleteProduct: async(req, res) => {
          let id = req.params.id
          res.send(await product.deleteProducts(id))
      },
      
      //ruta para agregar arrays
      addProductsFromArray: async (req, res)=> {
          let newProducts = req.body;
      
          if (!Array.isArray(newProducts)) {
              return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un array de productos' });
            }
      
            
        const addedProducts = [];
        for (const newProduct of newProducts) {
          // Convierte la cadena "true" o "false" en un booleano
          const availability = newProduct.availability === "true";
      
          if (
            !newProduct.img ||
            !newProduct.name ||
            !newProduct.description ||
            !newProduct.price ||
            !newProduct.stock ||
            !newProduct.category
          ) {
            return res.status(400).json({ error: 'Campos faltantes por proporcionar' });
          }
      
          // Agrega el producto a la base de datos y guarda el resultado en addedProducts
          const productToAdd = {
            img: newProduct.img,
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            stock: newProduct.stock,
            category: newProduct.category,
            availability: availability // Usa el valor booleano
          };
      
          const addedProduct = await product.addProducts(productToAdd);
          addedProducts.push(addedProduct);
        }
      
        res.json(addedProducts);
      },


}



export default productController;