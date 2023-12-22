import productsModel from './models/product.model.js'
import mongoose from 'mongoose'

export default class Products {
    constructor() {

    }

    get = async () => {
        let products = await productsModel.find().lean()
        return products
    }
    addProduct = async (prodData) => {
        try
        {
            let prodCreate = await productsModel.create(prodData);
            console.log("Producto añadido correctamente")
            return prodCreate
            
        }catch(error){
            console.error('Error al añadir producto:', error);
            return 'Error al añadir producto';
        }      
    }
    updateProduct = async (prodId, prodData) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(prodId)) {
                return 'ID de producto no válido';
            }
            let updatedProduct = await productsModel.updateOne({ _id: new mongoose.Types.ObjectId(prodId) }, { $set: prodData });

        } catch (error) {
            console.error('Error al actualizar producto:', error);
            return 'Error al actualizar producto';
        }
    }
    deleteProduct = async (productId) => {
        try {
            //Validación de Id
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return 'ID de producto no válido';
            }
    
            // Eliminación de producto por Id
            let deletedProduct = await productsModel.deleteOne({ _id: new mongoose.Types.ObjectId(productId) });
    
            if (deletedProduct.deletedCount > 0) {
                // Resultado de la eliminación
                return 'Producto eliminado exitosamente';
            } else {
                return 'No se encontró un producto con el ID especificado';
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            return 'Error al eliminar producto';
        }
    };
    getProductById = async (id) => { 
        try 
        {
          const prod = await productsModel.findById(id).lean();    
          if (!prod) 
          {
            return 'Usuario no encontrado';
          }   
          return prod;
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
          return 'Error al obtener el usuario';
        }
      }
}