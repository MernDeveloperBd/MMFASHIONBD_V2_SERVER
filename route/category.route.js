import { Router } from "express";
import auth from '../middleware/auth.js';
import upload from "../middleware/multer.js";
import { createCategory, deleteCategoryController, getCategoryController, getCategoryCountController, getSingleCategoryController, getSubCategoryCountController, removeImageFromCloudinary, updateCategoryController, uploadImagesController } from "../controllers/category.controller.js";

const categoryRouter = Router();
categoryRouter.post('/uploadImages',auth, upload.array('images'), uploadImagesController)
categoryRouter.post('/createCategory', auth, createCategory)
categoryRouter.get('/', getCategoryController)
categoryRouter.get('/get/count', getCategoryCountController)
categoryRouter.get('/get/count/subCat', getSubCategoryCountController)
categoryRouter.get('/single/:id', getSingleCategoryController)
categoryRouter.delete('/deleteImage', auth, removeImageFromCloudinary)
categoryRouter.delete('/single/:id', auth, deleteCategoryController)
categoryRouter.put('/:id', auth, updateCategoryController)



export default categoryRouter;