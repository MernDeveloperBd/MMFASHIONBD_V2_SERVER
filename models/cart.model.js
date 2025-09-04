import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productTitle: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
    },
    quantity: {
        type: Number,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    countInStock: {
        type: Number,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    brand: {
        type: String
    },
    productSize: {
        type: String
    },
    productColor: {
        type: String
    }
},
    {
        timestamps: true

    }
)

const cartProductModal = mongoose.model("cart", cartProductSchema)
export default cartProductModal;