import mongoose from "mongoose";

if(!process.env.MONGO_URI){
    throw new Error(
        "Please provide Mongodb_uri in the .env file"
    )
}

const connectDB = async() =>{
    try {
        // Establish connections
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✔ Database Connected');
        
    } catch (error) {
        console.log('😪 Database Connection Failed');
        
    }
}

export default connectDB;