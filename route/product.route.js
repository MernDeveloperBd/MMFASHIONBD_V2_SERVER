import { Router } from "express";
import upload from "../middleware/multer.js";
import { createProduct, getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLevelCatId, getAllProductsByThirdLevelCatName, uploadImagesController } from "../controllers/product.controller.js";
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

export default productRouter;