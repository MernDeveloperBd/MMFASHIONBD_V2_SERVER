
import AddressModal from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const addAddressController = async (req, res) => {
    try {
        const { address_line1, city, state, pincode, country, mobile, status, selected } = req.body;
        const userId = req.userId;

        /*   if (!address_line1 || !city || !state || !pincode || !country || !mobile ) {
              return res.status(500).json({
              message: "Please provide all the fields",
              error: true,
              success: false
          })
          }  */

        const address = new AddressModal({
            address_line1, city, state, pincode, country, mobile, status, userId, selected
        })
        const savedAddress = await address.save();

        const updateUserAddress = await UserModel.updateOne({ _id: userId }, {
            $push: {
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
export const getAddressController = async (req, res) => {
    try {
        const address = await AddressModal.find({ userId: req?.query?.userId });

        if (!address) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'Address not found'
            })
        }
        else{
            const updateUser = await UserModel.updateOne({_id: req?.query?.userId},{
                $push:{
                    address:address?._id
                }
            })
        }
        return res.status(200).json({
            success: true,
            error: false,
            data: address
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

