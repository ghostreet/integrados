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
            return updatedProduct
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
            return deletedProduct
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            return 'Error al eliminar producto';
        }
    };

    getProductById = async (productId) => {
        try {
               
            //Validación de Id
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('ID de producto no válido');
            }
    
            // Obtener el producto por Id
            let product = await productsModel.findById(productId);
    
            // Verificar si existe el producto
            if (!product) {
                throw new Error('No se encontró un producto con el ID especificado');
            }
    
            return product;
        } catch (error) {
            console.error('Error al obtener producto:', error);
            throw error;
        }
    };
    
    getProductOwnerById = async (productId) => {
        try {
            const product = await productsModel.findById(productId).lean();
            if (!product) {
                return 'Producto no encontrado';
            }
    
            // Obtén el ID del owner del producto
            const ownerId = product.owner;
            // Verifica si se encontró el owner y formatea el resultado
            if (ownerId) {
                return {owner : ownerId}
            } else {
                return 'Owner no encontrado';
            }
        } catch (error) {
            console.error('Error al obtener el owner del producto:', error);
            return 'Error al obtener el owner del producto';
        }
    };
}