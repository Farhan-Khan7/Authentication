import JWT from "jsonwebtoken";
import config from "../config/config.js";

export async function isLoggedIn(req, res, next) {
  try {
    // console.log(req.cookies);
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "unauthorized user!",
      });
    }

    const decode = JWT.verify(token, config.JWT_SECRET);

    // console.log(decode)`

    req.user = decode;
    return next();

  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized user!",
      success: false,
    });

  }

  next();

}
