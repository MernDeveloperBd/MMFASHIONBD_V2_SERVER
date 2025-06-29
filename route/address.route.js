import { Router } from "express";
import auth from "../middleware/auth.js";
import { addAddressController, getAllAddressController } from "../controllers/address.controller.js";

const addressRouter = Router();
addressRouter.post('/add', auth, addAddressController)
addressRouter.get('/get', auth, getAllAddressController)

export default addressRouter;