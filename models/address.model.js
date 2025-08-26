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
    city:{
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
   postCode:{
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
    type:mongoose.Schema.ObjectId,
    default:""
   }
},
{
    timestamps:true
})

const AddressModal = mongoose.model("address", addressSchema)
export default AddressModal;