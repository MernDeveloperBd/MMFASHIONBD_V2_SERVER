import { Router } from "express";
import auth from '../middleware/auth.js';
import upload from "../middleware/multer.js";
import { addHomeSlide, deleteMulipleSlide, deleteSlide, getHomeSlide, getHomeSlides, removeImageFromCloudinary, updateSlide, uploadImagesController } from "../controllers/homeSlider.controller.js";


const homeSlideRouter = Router();
homeSlideRouter.post('/uploadImages',auth, upload.array('images'), uploadImagesController)
homeSlideRouter.post('/add', auth, addHomeSlide)
homeSlideRouter.get('/', getHomeSlides)
homeSlideRouter.get('/:id', getHomeSlide)
homeSlideRouter.delete('/deleteImage', auth, removeImageFromCloudinary)
homeSlideRouter.delete('/deleteMultiple', auth, deleteMulipleSlide)
homeSlideRouter.delete('/:id', auth, deleteSlide)
homeSlideRouter.put('/:id', auth, updateSlide)



export default homeSlideRouter;