import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config()
// import 'dotenv/config' 
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/mongodb.js';
import userRouter from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import myListRouter from './route/myList.route.js';
import addressRouter from './route/address.route.js';
import homeSlideRouter from './route/homeSlide.route.js';

// app confit
const app = express();
const port = process.env.PORT || 5000 ;

// connectDB()

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
app.use('/api/cart', cartRouter )
app.use('/api/myList', myListRouter )
app.use('/api/address', addressRouter)
app.use('/api/homeSlides', homeSlideRouter)


app.get('/', (request, response)=>{
    response.json({
        message: `MM Fashion world is running on Port ${port}`
    })
})
/* app.listen(port, ()=>{
    console.log(`MM Fashion world is running on port: ${port}`);
}) */

connectDB().then(() =>{
    app.listen(port, ()=>{
    console.log(`MM Fashion world Server is running on port: ${port}`);
})
})