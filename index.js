import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/mongodb.js';
import userRouter from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';

// app confit
const app = express();
const port = process.env.PORT || 5000 ;

connectDB()

// Middleware
app.use(cors())
app.options('*', cors())

app.use(express.json())
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy: false
}))

// api
app.use('/api/user', userRouter)
app.use('/api/category', categoryRouter)
app.use('/api/product', productRouter )


app.get('/', (req, res)=>{
    res.send("Haramain Khushbo server is running")
})
app.listen(port, ()=>{
    console.log(`Haramain khushbo is running on port: ${port}`);
})