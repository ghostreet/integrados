import mongoose from 'mongoose';

const carCollection = 'carts';

const cartSchema = new mongoose.Schema({
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: Number,
        },
    ],
});

const cartModel = mongoose.model('Cart', cartSchema);

export default cartModel;