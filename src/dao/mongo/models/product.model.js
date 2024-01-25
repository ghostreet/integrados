import mongoose from "mongoose";

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
    img: {type: String, required: true},
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true},
    stock: { type: Number, required: true},
    category: { type: String, required: true},
    availability: { type: Boolean, required: true},
    owner: {type: String}
})
const productsModel = mongoose.model(productsCollection,productsSchema)
export default productsModel;