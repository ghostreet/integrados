import { promises as fs } from "fs";
import { nanoid } from "nanoid";
import Products from '../mongo/models/product.model.js'

export default class ProductManager { 
    constructor() {
        this.products = new Products();
    }

async addProducts(product) {
    try {
        const newProduct = new Products(product);
        await newProduct.save();
        return "Producto agregado correctamente"
    } catch (error) {
        throw error
    }
}

async deleteProduct(productId) {
    try {
        await Products.findByIdAndDelete(productId);
        return "Producto eliminado correctamente";
    } catch (error) {
        throw error;
    }
}

async updateProduct () {
    try {
      const id = req.params.id;
      const updateProducts = req.body;
      const result = await productManager.updateProducts(id, updateProducts);
      res.json({ message: result });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

async getProducts() {
    try {
        const products = await productsModel.find();
        return products;
    }catch(error) {
        throw error;
    }
}
async exist(productId) {
    console.log('Verificando existencia del producto con ID:', productId);
    try {
        // Utiliza findById para verificar si el producto existe
        const product = await productsModel.findById(productId);

        // Si el producto existe, devuélvelo
        if (product) {
            return product;
        } else {
            // Si el producto no existe, devuelve null o un mensaje de error
            return null;
            // O podrías lanzar un error indicando que el producto no existe
            // throw new Error('Producto no encontrado');
        }
    } catch (error) {
        console.error('Error al verificar si el producto existe:', error);
        // Manejar el error según tus necesidades
        return null;
    }
}

async addProductsFromArray () {
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

    const addedProduct = await productManager.addProducts(productToAdd);
    addedProducts.push(addedProduct);
  }

  res.json(addedProducts);
}

async getProdLimit(limit)
{
    try{
        const products = await productsModel.find().limit(limit);
        if (products.length < limit ){
            limit = products.length;
        }
        return products
    }catch (error) {
        throw error;
    }
}

async getProdPage(page, productPage)
{
    if (page <= 0) {
        page = 1
    }

    try {
        const products = await productsModel.find()
        .skip((page - 1) * productPage)
        .limit(productPage)
        return products;
    }catch (error) {
        throw error
    }
}

async getProdQuery(query) {
    try{
        const products = await productsModel.find({
            description : { $regex: query, $option: "i"}
        });
        return products;
    }catch (error) {
        throw error;
    }
}

async getProdSort (sortOrder){
    try {
        const products = await productsModel
        .find({})
        .sort({ price: sortOrder})
        return products
    }catch (error) {
        throw error;
    }
}

async getProdGeneral (page = 1, limit = 10, category, availability, sortOrder){
    try{
        let filter = {};

        const startIn = (page -1) * limit;
        const endIn = page * limit;

        const sortOp = {};

        if (sortOrder === 'up') {
            sortOp.price = 1;
        }else if (sortOrder ==='down'){
            sortOp.price = -1;
        }else {
            
        }
        if (category != ""){
            filter.category = category;
        }
        if (availability != "") {
            filter.availability = availability;
        }

        const query = productsModel.find(filter)
        .skip(startIn)
        .limit(limit)

        if (sortOrder === 'up' || sortOrder === 'down') {
            query.sort(sortOp);
          }     

        const products = await query.exec();
        
        const totalProds = await productsModel.countDocuments(filter);
        const totalPag = Math.ceil(totalProds / limit);
        const pagPrev = startIn > 0;
        const pagNext = endIn < totalProds;
        const prevLink = pagPrev ?  `/api/products?page=${page - 1}&limit=${limit}` : null;
        const nextLink = pagNext ?  `/api/products?page=${page + 1}&limit=${limit}` : null;

        return {
            status: 'success',
            payload: products,
            totalPages: totalPag,
            pagPrev: pagPrev ? page - 1 : null,
            pagNext: pagNext ? page + 1 : null,
            page: page,
            pagPrev: pagPrev,
            pagNext: pagNext,
            prevLink: prevLink,
            nextLink: nextLink,
        };
    }catch (error) {
        console.error('Error al obtener los productos', error)
        return { status: ' error ', payload: 'Error al obtener los productos'};
    }
}

async getProdId(id) {
    try {
        const product = await productsModel.findById(id);
        const productDetail = product.toJSON();
        return productDetail;
    }catch (error) {
        throw error;
    }
}


}

