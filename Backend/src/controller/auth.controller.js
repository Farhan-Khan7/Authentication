import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import JWT from "jsonwebtoken";
import userModel from "../model/User.model.js";
import config from "../config/config.js";

async function register(req, res) {
  try {
    const { userName, email, hashPassword } = req.body;

    // const usernameRegex = /^[a-zA-Z]+$/;
    if (!userName) {
      return res.status(400).json({
        message: "UserName must be required!",
      });
    }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return res.status(400).json({
        message: "email must be required!",
      });
    }

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;
    if (!hashPassword) {
      return res.status(400).json({
        message: "Password must be required!",
      });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const password = await bcrypt.hash(hashPassword, 10);

    const user = await userModel.create({
      userName,
      email,
      hashPassword: password,
    });

    // console.log(user);

    if (!user) {
      res.status(500).json({
        message: "User not registerd!",
      });
    }

    // const token = JWT.sign(
    //   {
    //     id: user._id,
    //   },
    //   config.JWT_SECRET,
    //   {
    //     expiresIn: "2h",
    //   },
    // );

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerficationToken = verificationToken;

    await user.save();

    res.status(201).json({
      message: "User Registerd Successfully",
      data: {
        userName,
        email,
      },
      success: true,
    });

    console.log(`Registered by ${user.userName}`)

    // Email Verification

    const transpoter = nodemailer.createTransport({
      host: config.MAILTRAP_HOST,
      port: config.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: config.MAILTRAP_USER,
        pass: config.MAILTRAP_PASS,
      },
    });

    const mailOptions = {
      from: config.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify Your Account!",
      text: `Please Click on the following link 
        ${config.BASE_URL}/auth/v1/api/verify/${verificationToken}`,
    };

    const emailSent = await transpoter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(`Email not send ${user.userName}`);
      }
      console.log(`Message sent to the ${user.email} : %s`, info.messageId);
    });

    
    

  } catch (error) {
    return res.status(500).json({
      message: "user not error",
      error,
      success: false,
    });
  }
}

async function verify(req, res) {
  try {
    const { emailVerficationToken } = req.params;

    if (!emailVerficationToken) {
      res.status(400).json({
        message: "Invalid Token !",
      });
    }

    const user = await userModel.findOne({ emailVerficationToken });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Token!",
      });
    }

    user.isVerified = true;

    user.emailVerficationToken = undefined;

    await user.save();

    res.status(200).json({
      message: "User Verification Successfull!",
      success: true,
    });

    console.log(`Verfied by ${user.userName}`)


  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error,
      success: false,
    });
  }
}

async function login(req, res) {
  try {
    const { email, hashPassword } = req.body;

    if (!email) {
      return res.status(401).json({
        message: "Email must be required",
      });
    }

    if (!hashPassword) {
      return res.status(401).json({
        message: "Password must be required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "email not registered!",
      });
    }

    const isValid = await bcrypt.compare(hashPassword, user.hashPassword);

    if (!isValid) {
      return res.status(401).json({
        message: "Password does not match!",
      });
    }

    const token = JWT.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      path : "/",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "User Login Successfully!",
      success: true,
      user: {
        name: user.userName,
        email: user.email,
      },
    });

    console.log(`Logged in by ${user.userName}`)

  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
      success: false,
    });
  }
}

async function profile(req, res) {
  try {
    // const decode = req.user
    // console.log(decode)
    const user = await userModel.findById(req.user.id);

    // console.log(user)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not Found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "user enter in profile!",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });

    console.log(`${user.userName} enter own profile!`)

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "User is unauthorized!",
    });
  }
}

async function logout(req , res) {

  try{
    res.clearCookie("token",{
    httpOnly: true,
    secure: false,
    path : "/"
   });
    res.status(200).json({
      success : true,
      message : "Logged out successfully!"
    })
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server Error!"
    })
  }

  console.log("Logged out Successfully!")

}
export { register, verify, login, profile , logout };
