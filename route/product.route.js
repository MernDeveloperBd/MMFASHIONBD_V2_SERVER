import { Router } from "express";
import upload from "../middleware/multer.js";
import { createProduct, deleteMultipleProduct, deleteProduct, getAllFeaturedProducts, getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsByPrice, getAllProductsByRating, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLevelCatId, getAllProductsByThirdLevelCatName, getAllProductsCount, getSingleProduct, removeImageFromCloudinary, updateProduct, uploadImagesController } from "../controllers/product.controller.js";
import auth from "../middleware/auth.js";

const productRouter = Router()
productRouter.post('/uploadImages',auth, upload.array('images'), uploadImagesController)
productRouter.post('/createProduct',auth, createProduct)
productRouter.get('/getAllProducts', getAllProducts)
productRouter.get('/getAllProductsByCatId/:id', getAllProductsByCatId)
productRouter.get('/getAllProductsByCatName', getAllProductsByCatName)
productRouter.get('/getAllProductsBySubCatId/:id', getAllProductsBySubCatId)
productRouter.get('/getAllProductsBySubCatName', getAllProductsBySubCatName)
productRouter.get('/getAllProductsByThirdSubCatId/:id', getAllProductsByThirdLevelCatId)
productRouter.get('/getAllProductsByThirdSubCatName', getAllProductsByThirdLevelCatName)
productRouter.get('/getAllProductsByPrice', getAllProductsByPrice)
productRouter.get('/getAllProductsByRating', getAllProductsByRating)
productRouter.get('/getAllProductsCount', getAllProductsCount)
productRouter.get('/getAllFeaturedProducts', getAllFeaturedProducts)
productRouter.delete('/:id', deleteProduct)
productRouter.get('/:id', getSingleProduct)
productRouter.delete('/deleteImage', auth, removeImageFromCloudinary)
productRouter.delete('/deleteMultipleImages', auth, deleteMultipleProduct)
productRouter.put('/updateProduct/:id', auth, updateProduct)

export default productRouter;