import dotenv from 'dotenv';
dotenv.config();
import sendEmailFun from "../config/sendEmail.js";
import generatedAccessToken from "../config/utils/generateAccessToken.js";
import generatedRefreshToken from "../config/utils/generateRefreshToken.js";
import verifyEmailTemplate from "../config/utils/verifyEmailTemplate.js";
import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
// ✅ Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
var imagesArr = [];
// register controller
export async function registerUserController(request, response) {
    try {
        let user;
        const { name, email, password } = request.body;
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide name, email, password",
                error: true,
                success: false
            })
        }
     user = await UserModel.findOne({ email: email })
        if (user) {
            return response.status(400).json({
                message: 'User already registered within this email',
                error: true,
                success: false
            })
        }
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            email: email,
            password: hashPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + 600000
        });
        await user.save();

        //Send verificaton email
        const verifyEmail = await sendEmailFun({
            to: email,
            subject: "Verify email from MM Fashion World",
            text: "",
            html: verifyEmailTemplate(name, verifyCode)
        })

        //create a jwt token for verification purposes
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_ACCESS_TOKEN_SECRET
        )
        return response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! Please veriry your email",
            token: token //optional: include this if needed for verification
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Verify email
export async function verifyEmailController(request, response) {
    try {
        const { email, otp } = request.body;
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            })
        }
        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires > Date.now();
        if (isCodeValid && isNotExpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpires = null

            await user.save()

            return response.status(200).json({ success: true, error: false, message: 'Email Verified successfully Done' })
        } else if (!isCodeValid) {
            return response.status(400).json({ success: false, error: true, message: 'Invalid OTP' })
        } else {
            return response.status(400).json({ success: false, error: true, message: 'OTP expired' })
        }
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Login user controller
export async function loginUserController(request, response) {
    try {
        const { email, password } = request.body;
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return response.status(400).json({
                message: "User not Register",
                error: true,
                success: false
            })
        }
        if (user.verify_email !== true) {
            return response.status(400).json({
                message: "Your Email is not verified yet. please verify your email",
                error: true,
                success: false
            })
        }
        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact to admin",
                error: true,
                success: false
            })
        }
        if (user.verify_email !== true) {
            return response.status(400).json({
                message: "Your Email is not verified. Please verify your email",
                error: true,
                success: false
            })
        }
        const checkPassword = await bcryptjs.compare(password, user.password);
        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }
        const accessToken = await generatedAccessToken(user._id)
        const refreshToken = await generatedRefreshToken(user._id)
       
        

        const updateUser = await UserModel.findByIdAndUpdate(user?._id, { last_login_date: new Date() })
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",

        }
        response.cookie('accessToken', accessToken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)

        return response.json({
            message: "Login successful",
            error: false,
            success: true,
            data: {
                accessToken, refreshToken
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

// logout controller
export async function logoutController(request, response) {
    try {
        const userid = request.userId;
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",

        }
        response.clearCookie('accessToken', cookiesOption)
        response.clearCookie('refreshToken', cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, { refresh_token: "" });

        return response.json({
            message: "Logout successfully",
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

//Image upload

export async function userAvatarController(request, response) {
    try {
        imagesArr = [];
        const userId = request.userId;
        const image = request.files;
        const user = await UserModel.findOne({ _id: userId })
        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            })
        }
        //First remove image from cloudinay
        const imgUrl = user.avatar;
        const urlArr = imgUrl.split("/");
        const avatar_image = urlArr[urlArr.length - 1];
        const imageName = avatar_image.split(".")[0];

        if (imageName) {
            const result = await cloudinary.uploader.destroy(
                imageName,
                (error, result) => {

                }
            );
        };

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {
            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    console.log(result)                    
                    imagesArr.push(result?.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);                                      
                }
            )
        };
        user.avatar = imagesArr[0];
        await user.save();

        return response.status(200).json({
            _id: userId,
            avatar: imagesArr[0]
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}
// remove image
export async function removeImageFromCloudinary(request, response) {
    const imgUrl = request.query.img;

    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
        const result = await cloudinary.uploader.destroy(
            imageName,
            (error, result) => {

            }
        );
        if (result) {
            response.status(200).send(result)
        }
    }

}

// update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId;
        const { name, email, mobile, password } = request.body;
        const userExist = await UserModel.findById(userId)
        if (!userExist)
            return response.status(400).send("The user cannot be updated")

        let verifyCode = "";
        if (email !== userExist.email) {
            verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        }
        let hashPassword = ""
        if (password) {
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password, salt)
        } else {
            hashPassword = userExist.password;
        }

        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                name: name,
                 mobile: mobile, 
                 email: email,
                  verify_email: email !== userExist.email ? false : true,
                  password: hashPassword,
                otp: verifyCode !== "" ? verifyCode : null,
                otpExpires: verifyCode !== "" ? Date.now() + 600000 : ""
            },
            { new: true }
        );
        if (email !== userExist.email) {
            // send verification email
            await sendEmailFun({
                sentTo: email,
                subject: "Verify email from MM Fashion World",
                text: "",
                html: VerificationEmail(name, verifyCode)
            })
        }

        return response.json({
            message: "User Updated Successfully",
            error: false,
            success: true,
            user: updateUser
          /*   user: {
                name: updateUser?.name,
                _id: updateUser?._id,
                email: updateUser?.email,
                mobile: updateUser?.mobile,
                avatar: updateUser?.avatar,
            } */
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
//Forgot password
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body;
        const user = await UserModel.findOne({ email: email });
        console.log(user);
        

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }
        else {
            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            
          user.otp = verifyCode;
            user.otpExpires = Date.now() + 600000;
            await user.save()
  
            await sendEmailFun({
                to: email,
                subject: "Forgot password Verify email from MM Fashion World",
                text: "",
                html: verifyEmailTemplate(user?.name, verifyCode)
            })

            return response.json({
                message: "Check your email",
                error: false,
                success: true
            })

        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// verify fotgot password otp
export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body;
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }
        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide require field email otp",
                error: true,
                success: false
            })
        }
        if (otp !== user.otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            })
        }
        const currentTime = new Date().toLocaleString()
        if (user.otpExpires < currentTime) {
            return response.status(400).json({
                message: "OTP is Expired",
                error: true,
                success: false
            })
        }
        user.otp = ""
        user.otpExpires = "";
        await user.save()

        return response.status(200).json({
            message: "OTP Verified successfully!",
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

// Reset password controller
export async function resetPasswordController(request, response) {
    try {
        const { email,  newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                error: true, 
                success: false,
                message: "Provide required fields email, newPassword, confirmPassword"
            })
        }
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }
      
        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same",
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);
        user.password = hashPassword;
        await user.save();

        const update = await UserModel.findOneAndUpdate(user?._id,{
            password : hashPassword
        })

        return response.json({
            message: "Password Updated Successfully",
            error: false,
            success: true,

        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Refresh token controller
export async function refreshTokenController(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]
        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid Token",
                error: true,
                success: false
            })
        }
        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
        if (!verifyToken) {
            return response.status(401).json({
                message: "Token is Expired",
                error: true,
                success: false
            })
        }
        const userId = verifyToken?._id;
        const newAccessToken = await generatedAccessToken(userId);

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        response.cookie("accessToken", newAccessToken, cookiesOption);

        return response.json({
            message: "New access token genereated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get login user Details
export async function userDetailsController(request, response) {
    try {
        const userId = request.userId;
        const user = await UserModel.findById(userId).select('-password -refresh_token').populate('address_details');
        return response.json({
            message: "User Details",
            data: user,
            success: true,
            error: false,
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}