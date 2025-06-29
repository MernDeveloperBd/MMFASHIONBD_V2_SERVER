import MyListModel from "../models/myList.model.js";

// add to my list
export const AddToMyListController = async(req, res)=>{
    try {
        const userId = req.userId; //middleware
        const{productId, productTitle, image, rating, price, oldPrice, brand, discount} = req.body;

        const item = await MyListModel.findOne({
            userId: userId,
            productId: productId
        })
console.log(item);

        if(item){
            return res.status(400).json({
                message: "Item already in My LIst",
            })
        }
        const myList = new MyListModel({
            productId, productTitle, image, rating, price, oldPrice, brand, discount, userId
        })
        const save = await myList.save();
         return res.status(200).json({
            message: "The product added in my list",
            error: false,
            success: true
        })

    } catch (error) {
         return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// delete from my list
export const deleteFromMyListController = async(req, res)=>{
    try {
        const myListItem = await MyListModel.findById(req.params.id);
        if(!myListItem){
            return res.status(404).json({
            message: "The item with this given id was not found",
            error: true,
            success: false
        })
        }
        const deletedItem = await MyListModel.findByIdAndDelete(req.params.id);
        if(!deletedItem){
             return res.status(404).json({
            message: "The item is not deleted",
            error: true,
            success: false
        })
        }
          return res.status(200).json({
            message: "The item removed from my list",
            error: false,
            success: true
        })

    } catch (error) {
          return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get from my list
export const getMyListController = async(req, res)=>{
    try {
        const userId = req.userId;
        const myListItems = await MyListModel.find({
            userId: userId
        })
        return res.status(200).json({
            error:false,
            success: true,
            data: myListItems
        })


    } catch (error) {
         return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}