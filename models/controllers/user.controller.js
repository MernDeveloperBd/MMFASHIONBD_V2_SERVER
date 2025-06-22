import sendEmailFun from "../../config/sendEmail.js";
import generatedAccessToken from "../../config/utils/generateAccessToken.js";
import generatedRefreshToken from "../../config/utils/generateRefreshToken.js";
import verifyEmailTemplate from "../../config/utils/verifyEmailTemplate.js";
import UserModel from "../user.model.js";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken'

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
    if (user.status !== "Active") {
        return res.status(400).json({
            message: "Contact to Admin",
            error: true,
            success: false
        })
    }
    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
        return res.status(400).json({
            message: "Contact to Admin",
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
        message:"Login successfully",
        error: false,
        success:true,
        data:{
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