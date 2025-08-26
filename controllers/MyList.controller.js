import MyListModel from "../models/myList.model.js";

// add to my list
export const AddToMyListController = async(request, response)=>{
    try {
        const userId = request.userId; //middleware
        const{productId, productTitle, image, rating, price, oldPrice, resellingPrice, catName, discount} = request.body;

        const item = await MyListModel.findOne({
            userId: userId,
            productId: productId
        })
console.log(item);

        if(item){
            return response.status(400).json({
                message: "Item already in My List",
            })
        }
        const myList = new MyListModel({
            productId,userId, productTitle, image, rating, price, oldPrice, resellingPrice,catName, discount
        })
        const save = await myList.save();

         return response.status(200).json({
            message: "The product added in my list",
            error: false,
            success: true
        })

    } catch (error) {
         return response.status(500).json({
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