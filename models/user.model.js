import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Provided name"]
    },
    email:{
        type: String,
        required:[true, "Provided email"],
        unique:true
    },
    password:{
        type:String,
        required:[true, "Provided password"]
    },
    avatar:{
        type: String,
        default:""
    },
    mobile:{
        type:Number,
        default:null
    },
    verify_email:{
        type:Boolean,
        default: false
    },
    access_token:{
        type: String,
        default:''
    },
    refresh_token:{
        type:String,
        default: ''
    },
    last_login_date:{
        type:Date,
        default:""
    },
    status:{
        type:String,
        enum:["Active", "Inactive", "Suspended"],
        default:"Active"
    },
    address_details:[
        {
            type:mongoose.Schema.ObjectId,
            ref: 'address'
        }
    ],
    shopping_cart:[
        {

            type:mongoose.Schema.ObjectId,
            ref:'cartProduct'
        }
    ],
    orderHistory:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'order'
        }
    ],
    forgot_password_otp:{
        type:String,
        default: null
    },
    forgot_password_expiry:{
        type: Date,
        default:""
    },
    otp:{
        type:String,
    },
    otpExpires:{
        type: Date
    },
    role:{
        type:String,
        enum:['ADMIN', 'USER', 'RESELLER','WHOLESELLER'],
        default:"USER"
    }
},
{
    timestamps:true
})

const UserModel = mongoose.model("User", userSchema)
export default UserModel;