import { promises as fs } from "fs";
import { nanoid } from "nanoid";
import { productsModel} from '../models/product.model.js'


class ProductsManager extends productsModel {
    constructor() {
        super();
    }


async addProducts(product) {
    try {
        const newProduct = new productsModel(product);
        await newProduct.save();
        return "Producto agregado correctamente"
    } catch (error) {
        throw error
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

async getProdLimit(limit)
{
    try{
        const products = await productsManager.find().limit(limit);
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
        const products = await productsManager.find()
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

        const query = ProductsManager.find(filter)
        .skip(startIn)
        .limit(limit)

        if (sortOrder === 'up' || sortOrder === 'down') {
            query.sort(sortOp);
          }     

        const products = await query.exec();
        
        const totalProds = await ProductsManager.countDocuments(filter);
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

export default ProductsManager