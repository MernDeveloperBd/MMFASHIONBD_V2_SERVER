
import AddressModal from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const addAddressController = async (request, response) => {
    try {
        const { address_line1,division, city, upazila, state, postCode, country, mobile, status, selected } = request.body;
        const userId = request.userId;

        const address = new AddressModal({
            address_line1, division, city, upazila, state, postCode, country, mobile, status, userId, selected
        })
        const savedAddress = await address.save();

        const updateUserAddress = await UserModel.updateOne({ _id: userId }, {
            $push: {
                address_details: savedAddress?._id
            }
        })

        return response.status(200).json({
            data: savedAddress,
            message: "Address added successfully",
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

// get address controller 
export const getAddressController = async (request, response) => {
    try {
        const address = await AddressModal.find({ userId: request?.query?.userId });

        if (!address) {
            return response.status(404).json({
                success: false,
                error: true,
                message: 'Address not found'
            })
        }
        else{
            const updateUser = await UserModel.updateOne({_id: request?.query?.userId},{
                $push:{
                    address:address?._id
                }
            })
        }
        return response.status(200).json({
            success: true,
            error: false,
            data: address
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const deleteAddressController = async (request, response) =>{
    try {
        const userId = request.userId; 
        const _id = request.params.id;
        if(!_id){
             return response.status(400).json({
            message: "Provide _id",
            error: true,
            success: false
        })
        }
        const deleteItem = await AddressModal.deleteOne({_id: _id, userId: userId})
        if(!deleteItem){
            return response.status(404).json({
            message: "The Address in the database is not found",
            error: true,
            success: false
        })
        }
        
        return response.json({
            message: "Address removed",
            error: false,
            success: true,
            data:deleteItem
        })

    } catch (error) {
         return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
