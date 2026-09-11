import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import userModel from "../model/User.model.js";
import config from "../config/config.js";

async function register(req, res) {
  const { userName, email, hashPassword } = req.body;


  if (!userName) {
    res.status(400).json({
      message: "UserName must be required!",
    });
  }

  if (!email) {
    res.status(400).json({
      message: "email must be required!",
    });
  }

  if (!hashPassword) {
    res.status(400).json({
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

  const token = JWT.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "2h",
    },
  );

  res.status(200).json({
    message : "User Registerd Successfully",
    data : {
      userName,
      email,
    }
  })

}

async function login(req, res) {}

export { register, login };
