
import AddressModal from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const addAddressController = async (req, res) => {
    try {
        const { address_line1, city, state, pincode, country, mobile, status } = req.body;
        const userId = req.userId;

        if (!address_line1 || !city || !state || !pincode || !country || !mobile ) {
            return res.status(500).json({
            message: "Please provide all the fields",
            error: true,
            success: false
        })
        } 

        const address = new AddressModal({
            address_line1, city, state, pincode, country, mobile, status , userId
        })
        const savedAddress = await address.save();

         const updateUserAddress = await UserModel.updateOne({_id: userId}, {
            $push:{
                address_details: savedAddress?._id
            }
        })

         return res.status(200).json({
            data: savedAddress,
            message: "Address added successfully",
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

// get address controller
export const getAllAddressController = async (req, res)=>{
try {
    const address = await AddressModal.find({userId:req?.query?.userId});
    if(!address){
        return res.status({
            error: true,
            success:false,
            message:'Address not found'
        })
    }
      return res.status({
            error: false,
            success:true,
            address:address
        })
} catch (error) {
      return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
}
}