import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.MONGO_URI){
    throw new Error("Please provide Mongodb_uri in the .env file")
}
const connectDB = async() =>{
    try {
        // Establish connections
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✔ Database Connected');        
    } catch (error) {
        console.log('😪 Database Connection Failed');   
        process.exit(1)     
    }
}
export default connectDB;