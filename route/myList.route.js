import { Router } from "express";
import auth from "../middleware/auth.js";
import { AddToMyListController, deleteFromMyListController, getMyListController } from "../controllers/MyList.controller.js";

const myListRouter = Router();
myListRouter.post('/add', auth, AddToMyListController)
myListRouter.get('/', auth, getMyListController)
myListRouter.delete('/:id', auth, deleteFromMyListController)

export default myListRouter;