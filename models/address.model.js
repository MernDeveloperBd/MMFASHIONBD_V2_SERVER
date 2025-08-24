import mongoose from "mongoose";
const addressSchema =new mongoose.Schema({
    address_line1:{
        type:String,
        default: ""
    },
    division:{
        type:String,
        default: ""
    },
    district:{
        type:String,
        default: ""
    },
    upazila:{
        type:String,
        default: ""
    },
   state:{
    type: String,
    default: ""
   },
   pincode:{
    type: String
   },
   country:{
    type: String
   },
   mobile:{
    type: Number,
    default: null
   },
   status:{
    type:Boolean,
    default: true
   },
   selected:{
    type:Boolean,
    default: true
   },
   userId:{
    type:String,  //mongoose.Schema.ObjectId ( or prev )
    default:""
   }
},
{
    timestamps:true
})

const AddressModal = mongoose.model("address", addressSchema)
export default AddressModal;