import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
      image: {
        type:String,
        default: '',
    }    ,
    userName:{
        type:String,
        default: '',
    },
    review:{
        type:String,
        default: '',
    },
    rating:{
        type:String,
        default: '',
    },
    userId:{
        type:String,
        default: '',
    },  
    productId:{
        type:String,
        default: '',
    },  
    },
{
    timestamps:true
})
    
    const ReviewModel = mongoose.model("Review", reviewSchema)
    export default ReviewModel;