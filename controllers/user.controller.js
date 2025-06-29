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

// register controller
export async function registerUserController(req, res) {
    try {
        let user;
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "provide name, email, password",
                error: true,
                success: false
            })
        }
         user = await UserModel.findOne({ email: email })
        if (user) {
            return res.status(400).json({
                message: 'User already registered within this email',
                error: true,
                success: false
            })
        }
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            name: name,
            email: email,
            password: hashPassword,
            otp: verifyCode,
            otpExpires: Date.now() + 600000
        });
        await user.save();

        //    Send verificaton email
        await sendEmailFun({
            to: email,
            subject: "Verify email from Haramain khushboo shop",
            text: "",
            html: verifyEmailTemplate(name, verifyCode)
        })

        //create a jwt token for verification purposes
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        )
        return res.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! Please veriry your email",
            token: token //optional: include this if needed for verification
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Verify email
export async function verifyEmailController(req, res) {
    try {
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return res.status(400).json({
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
            return res.status(200).json({ success: true, error: false, message: 'Email Verified successfully' })
        } else if (!isCodeValid) {
            return res.status(400).json({ success: false, error: true, message: 'Invalid OTP' })
        } else {
            return res.status(400).json({ success: false, error: true, message: 'OTP expired' })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Login user controller
export async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                message: "User not Register",
                error: true,
                success: false
            })
        }
        if (user.verify_email !== true) {
            return res.status(400).json({
                message: "Your Email is not verified yet. please verify your email",
                error: true,
                success: false
            })
        }
        const checkPassword = await bcryptjs.compare(password, user.password);
        if (!checkPassword) {
            return res.status(400).json({
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
        res.cookie('accessToken', accessToken, cookiesOption)
        res.cookie('refreshToken', refreshToken, cookiesOption)

        return res.json({
            message: "Login successful",
            error: false,
            success: true,
            data: {
                accessToken, refreshToken
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

// logout controller
export async function logoutController(req, res) {
    try {
        const userid = req.userId;
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",

        }
        res.clearCookie('accessToken', cookiesOption)
        res.clearCookie('refreshToken', cookiesOption)

        await UserModel.findByIdAndUpdate(userid, { refresh_token: "" });

        return res.json({
            message: "Logout successfully",
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

//Image upload
var imagesArr = [];
export async function userAvatarController(req, res) {
    try {
        imagesArr = [];

        const userId = req.userId;
        const image = req.files;

        const user = await UserModel.findOne({ _id: userId })

        if (!user) {
            return res.status(400).json({
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
            //

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
                    imagesArr.push(result?.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`);
                }
            )
        };
        user.avatar = imagesArr[0];
        await user.save();

        return res.status(200).json({
            _id: userId,
            avatar: imagesArr[0]
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}
// remove image
export async function removeImageFromCloudinary(req, res) {
    const imgUrl = req.query.img;

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
            res.status(200).send(result)
        }

    }

}

// update user details
export async function updateUserDetails(req, res) {
    try {
        const userId = req.userId;
        const { name, email, mobile, password } = req.body;
        const userExist = await UserModel.findById(userId)
        if (!userExist)
            return res.status(400).send("The user cannot be updated")

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
                name: name, mobile: mobile, email: email, verify_email: email !== userExist.email ? false : true, password: hashPassword,
                otp: verifyCode !== "" ? verifyCode : null,
                otpExpires: verifyCode !== "" ? Date.now() + 600000 : ""
            },
            { new: true }
        );
        if (email !== userExist.email) {
            // send verification email
            await sendEmailFun({
                sentTo: email,
                subject: "Verify email from Haramain Khushbo Shop",
                text: "",
                html: VerificationEmail(name, verifyCode)
            })
        }

        return res.json({
            message: "User Updated Successfully",
            error: false,
            success: true,
            user: {
                name: updateUser?.name,
                _id: updateUser?._id,
                email: updateUser?.email,
                mobile: updateUser?.mobile,
                avatar: updateUser?.avatar,

            }
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
//Forgot password
export async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
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
                subject: "Forgot password Verify email from Haramain khushboo shop",
                text: "",
                html: verifyEmailTemplate(user?.name, verifyCode)
            })

            return res.json({
                message: "Check your email",
                error: false,
                success: true
            })

        }

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// verify fotgor password otp
export async function verifyForgotPasswordOtp(req, res) {
    try {
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }
        if (!email || !otp) {
            return res.status(400).json({
                message: "Provide require field email otp",
                error: true,
                success: false
            })
        }
        if (otp !== user.otp) {
            return res.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            })
        }
        const currentTime = new Date().toLocaleString()
        if (user.otpExpires < currentTime) {
            return res.status(400).json({
                message: "OTP is Expired",
                error: true,
                success: false
            })
        }
        user.otp = ""
        user.otpExpires = "";
        await user.save()

        return res.status(200).json({
            message: "OTP Verified successfully!",
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

// Reset password controller
export async function resetPasswordController(req, res) {
    try {
        const { email,  newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                error: true, 
                success: false,
                message: "Provide required fields email, newPassword, confirmPassword"
            })
        }
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }
      
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "newPassword and confirmPassword must be same",
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);
        user.password = hashPassword;
        await user.save();

        return res.json({
            message: "Password Updated Successfully",
            error: false,
            success: true,

        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Refresh token controller
export async function refreshTokenController(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]
        if (!refreshToken) {
            return res.status(401).json({
                message: "Invalid Token",
                error: true,
                success: false
            })
        }
        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
        if (!verifyToken) {
            return res.status(401).json({
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
        res.cookie("accessToken", newAccessToken, cookiesOption);

        return res.json({
            message: "New access token genereated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get login user Details
export async function userDetailsController(req, res) {
    try {
        const userId = req.userId;
        const user = await UserModel.findById(userId).select('-password -refresh_token');
        return res.json({
            message: "User Details",
            data: user,
            error: false,
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}