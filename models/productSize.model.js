import mongoose from "mongoose";

const productSizeSchema = new mongoose.Schema({
      name:{
        type:String,
        required: true,
    },
      dateCreated:{
        type:Date,
        default: Date.now,
    },
    
},
{
    timestamps:true
})

const ProductSizeModel = mongoose.model("ProductSize", productSizeSchema)
export default ProductSizeModel;