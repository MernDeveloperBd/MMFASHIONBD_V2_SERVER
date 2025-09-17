import { Router } from "express";
import upload from "../middleware/multer.js";
import { categoryCounts, createProduct,  createProductSize, deleteMultipleProduct, deleteProduct, deleteProductMultipleSize, deleteProductSize, filters, getAllFeaturedProducts, getAllProducts, getAllProductsByCatId, getAllProductsByCatName, getAllProductsByPrice, getAllProductsByRating, getAllProductsBySubCatId, getAllProductsBySubCatName, getAllProductsByThirdLevelCatId, getAllProductsByThirdLevelCatName, getAllProductsCount, getProductSize, getProductSizeById, getSingleProduct, removeImageFromCloudinary, updateProduct, updateProductSize, uploadImagesController,uploadBannerImagesController } from "../controllers/product.controller.js";
import auth from "../middleware/auth.js";
import { createProductColor, deleteProductColor, deleteProductMultipleColor, getProductColor, getProductColorById, updateProductColor } from "../controllers/color.controller.js";

const productRouter = Router()
productRouter.post('/uploadImages',auth, upload.array('images'), uploadImagesController)
productRouter.post('/uploadBannerImages',auth, upload.array('bannerImages'), uploadBannerImagesController)
productRouter.post('/createProduct',auth, createProduct)
productRouter.get('/getAllProducts', getAllProducts)
productRouter.get('/getAllProductsBanners', getAllProductsBanners)
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
productRouter.delete('/deleteMultiple', auth, deleteMultipleProduct)
productRouter.put('/updateProduct/:id', auth, updateProduct)

productRouter.post('/productSize/create', auth, createProductSize)
productRouter.delete('/productSize/:id', deleteProductSize)
productRouter.put('/productSize/:id', auth, updateProductSize)
productRouter.delete('/deleteMultipleSize', auth, deleteProductMultipleSize)
productRouter.get('/productSize/get', getProductSize)
productRouter.get('/productSize/:id', getProductSizeById)

productRouter.post('/productColor/create', auth,createProductColor )
productRouter.delete('/productColor/:id', deleteProductColor)
productRouter.put('/productColor/:id', updateProductColor)
productRouter.delete('/deleteMultipleColor', auth, deleteProductMultipleColor)
productRouter.get('/productColor/get', getProductColor)
productRouter.get('/productColor/:id', getProductColorById)

productRouter.post('/filters', filters )
productRouter.get('/category-counts', auth, categoryCounts);

export default productRouter;
