import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import JWT from "jsonwebtoken";
import userModel from "../model/User.model.js";
import config from "../config/config.js";

async function register(req, res) {
  try {
    const { userName, email, hashPassword } = req.body;

    if (!userName) {
      return res.status(400).json({
        message: "UserName must be required!",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "email must be required!",
      });
    }

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

    console.log("After Transporter !")

    console.log("Before mailOptions !")

    const mailOptions = {
      from: config.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify Your Account!",

      // Plain text fallback
      text: `
        Hello ${user.userName},

        Welcome to MyApp!

        Please verify your email address by clicking the link below:

        ${config.BASE_URL}/auth/v1/api/verify/${verificationToken}

        This verification link will help us confirm that this email
        address belongs to you.

        If you did not create an account with us, please ignore this email.

        Thanks,
        MyApp Team
    `,

      // HTML Email
      html: `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Account</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        ">

            <div style="
                width: 100%;
                padding: 40px 0;
            ">

                <div style="
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                ">

                    <!-- Header -->
                    <div style="
                        background-color: #111827;
                        padding: 25px;
                        text-align: center;
                    ">
                        <h1 style="
                            margin: 0;
                            color: #ffffff;
                            font-size: 26px;
                        ">
                            MyApp
                        </h1>
                    </div>

                    <!-- Content -->
                    <div style="
                        padding: 40px;
                    ">

                        <h2 style="
                            margin-top: 0;
                            color: #111827;
                            font-size: 24px;
                        ">
                            Verify Your Account
                        </h2>

                        <p style="
                            color: #4b5563;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            Hello <strong>${user.userName}</strong>,
                        </p>

                        <p style="
                            color: #4b5563;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            Welcome to <strong>MyApp</strong>!
                            We're excited to have you on board.
                        </p>

                        <p style="
                            color: #4b5563;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            Please verify your email address by clicking
                            the button below.
                        </p>

                        <!-- Verify Button -->
                        <div style="
                            text-align: center;
                            margin: 35px 0;
                        ">
                            <a
                                href="${config.BASE_URL}/auth/v1/api/verify/${verificationToken}"
                                style="
                                    display: inline-block;
                                    background-color: #2563eb;
                                    color: #ffffff;
                                    text-decoration: none;
                                    padding: 14px 30px;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: bold;
                                "
                            >
                                Verify My Account
                            </a>
                        </div>

                        <!-- Verification Info -->
                        <div style="
                            background-color: #eff6ff;
                            border-left: 4px solid #2563eb;
                            padding: 15px;
                            margin: 25px 0;
                        ">
                            <p style="
                                margin: 0;
                                color: #1e40af;
                                font-size: 14px;
                                line-height: 1.5;
                            ">
                                Please verify your email address to
                                complete your account setup.
                            </p>
                        </div>

                        <!-- Fallback URL -->
                        <p style="
                            color: #6b7280;
                            font-size: 14px;
                            line-height: 1.5;
                        ">
                            If the button doesn't work, copy and paste
                            the following link into your browser:
                        </p>

                        <div style="
                            background-color: #f3f4f6;
                            padding: 12px;
                            border-radius: 6px;
                            word-break: break-all;
                        ">
                            <a
                                href="${config.BASE_URL}/auth/v1/api/verify/${verificationToken}"
                                style="
                                    color: #2563eb;
                                    font-size: 13px;
                                    text-decoration: none;
                                "
                            >
                                ${config.BASE_URL}/auth/v1/api/verify/${verificationToken}
                            </a>
                        </div>

                        <!-- Security Notice -->
                        <p style="
                            color: #6b7280;
                            font-size: 14px;
                            line-height: 1.6;
                            margin-top: 30px;
                        ">
                            If you did not create an account with
                            MyApp, you can safely ignore this email.
                        </p>

                    </div>

                    <!-- Footer -->
                    <div style="
                        background-color: #f9fafb;
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #e5e7eb;
                    ">

                        <p style="
                            margin: 0;
                            color: #9ca3af;
                            font-size: 12px;
                        ">
                            © 2026 MyApp. All rights reserved.
                        </p>

                        <p style="
                            margin: 8px 0 0;
                            color: #9ca3af;
                            font-size: 12px;
                        ">
                            This is an automated email. Please do not reply.
                        </p>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `
    };

    console.log("After mailOptions !")
    
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

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: "email not verified!"
      })
    } else {
      if (!user) {
        return res.status(401).json({
          message: "email not registered!",
        });
      }

      user.isLoggedIn = true
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
        path: "/",
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

      await user.save()
      console.log(`Logged in by ${user.userName}`)
    }
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

    console.log("in profile part : ", user.isLoggedIn)

    if (!user.isLoggedIn) {
      return res.status(401).json({
        success: false,
        message: "user not login!"
      })
    } else {
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
    }

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "User is unauthorized!",
    });
  }
}

async function logout(req, res) {

  try {
    const { isLoggedIn } = req.body
    const user = await userModel.findOne({ isLoggedIn })

    console.log("in logout part ", user.isLoggedIn)

    user.isLoggedIn = false

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      path: "/"
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully!"
    })

    await user.save()

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server Error!"
    })
  }

  console.log("Logged out Successfully!")

}

async function forgotPassword(req, res) {

  const { email } = req.body

  try {
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "wrong email!"
      })
    }

    const user = await userModel.findOne({ email })

    console.log("in forgotpassword : ", user.isLoggedIn)

    if (!user.isLoggedIn) {
      return res.status(401).json({
        success: false,
        message: "User not Logged In!"
      })

    } else {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email!"
        })
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenTime = new Date(Date.now() + 10 * 60 * 1000);


      user.resetPasswordToken = resetToken
      user.resetPasswordExpires = resetTokenTime

      await user.save()


      const transporter = nodemailer.createTransport({
        host: config.MAILTRAP_HOST,
        port: config.MAILTRAP_PORT,
        secure: false, // 465 => true, 587 => false

        auth: {
          user: config.MAILTRAP_USER,
          pass: config.MAILTRAP_PASS
        }
      });



      const mailOptions = {
        from: config.MAILTRAP_SENDEREMAIL,
        to: user.email,
        subject: "Reset your Password!",

        // Plain text fallback
        text: `
        Hello ${user.userName},

        We received a request to reset your password.

        Reset your password using this link:
        ${config.BASE_URL}/auth/v1/api/resetpassword/${resetToken}

        This link will expire in 10 minutes.

        If you did not request a password reset, please ignore this email.

        Thanks,
        MyApp Team
    `,

        // HTML Email
        html: `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        ">

            <div style="
                width: 100%;
                padding: 40px 0;
            ">

                <div style="
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                ">

                    <!-- Header -->
                    <div style="
                        background-color: #111827;
                        padding: 25px;
                        text-align: center;
                    ">
                        <h1 style="
                            margin: 0;
                            color: #ffffff;
                            font-size: 26px;
                        ">
                            MyApp
                        </h1>
                    </div>

                    <!-- Content -->
                    <div style="
                        padding: 40px;
                    ">

                        <h2 style="
                            margin-top: 0;
                            color: #111827;
                            font-size: 24px;
                        ">
                            Reset Your Password
                        </h2>

                        <p style="
                            color: #4b5563;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            Hello <strong>${user.userName}</strong>,
                        </p>

                        <p style="
                            color: #4b5563;
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            We received a request to reset the password
                            for your account. Click the button below to
                            create a new password.
                        </p>

                        <!-- Reset Button -->
                        <div style="
                            text-align: center;
                            margin: 35px 0;
                        ">
                            <a
                                href="${config.BASE_URL}/auth/v1/api/resetpassword/${resetToken}"
                                style="
                                    display: inline-block;
                                    background-color: #2563eb;
                                    color: #ffffff;
                                    text-decoration: none;
                                    padding: 14px 30px;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: bold;
                                "
                            >
                                Reset Password
                            </a>
                        </div>

                        <!-- Expiry Warning -->
                        <div style="
                            background-color: #fff7ed;
                            border-left: 4px solid #f97316;
                            padding: 15px;
                            margin: 25px 0;
                        ">
                            <p style="
                                margin: 0;
                                color: #9a3412;
                                font-size: 14px;
                                line-height: 1.5;
                            ">
                                This password reset link will expire
                                in <strong>10 minutes</strong>.
                            </p>
                        </div>

                        <!-- Fallback URL -->
                        <p style="
                            color: #6b7280;
                            font-size: 14px;
                            line-height: 1.5;
                        ">
                            If the button doesn't work, copy and paste
                            the following link into your browser:
                        </p>

                        <div style="
                            background-color: #f3f4f6;
                            padding: 12px;
                            border-radius: 6px;
                            word-break: break-all;
                        ">
                            <a
                                href="${config.BASE_URL}/auth/v1/api/resetpassword/${resetToken}"
                                style="
                                    color: #2563eb;
                                    font-size: 13px;
                                    text-decoration: none;
                                "
                            >
                                ${config.BASE_URL}/auth/v1/api/resetpassword/${resetToken}
                            </a>
                        </div>

                        <!-- Security Notice -->
                        <p style="
                            color: #6b7280;
                            font-size: 14px;
                            line-height: 1.6;
                            margin-top: 30px;
                        ">
                            If you did not request a password reset,
                            you can safely ignore this email. Your
                            password will remain unchanged.
                        </p>

                    </div>

                    <!-- Footer -->
                    <div style="
                        background-color: #f9fafb;
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #e5e7eb;
                    ">

                        <p style="
                            margin: 0;
                            color: #9ca3af;
                            font-size: 12px;
                        ">
                            © 2026 MyApp. All rights reserved.
                        </p>

                        <p style="
                            margin: 8px 0 0;
                            color: #9ca3af;
                            font-size: 12px;
                        ">
                            This is an automated email. Please do not reply.
                        </p>

                    </div>

                </div>

            </div>

        </body>
        </html>
    `
      };



      transporter.sendMail(mailOptions, (error, info) => {

        if (error) {
          return console.log(
            `Email Not Sent to ${user.userName} \n${error.message}`
          );
        } else {
          console.log(
            `Message Sent to ${user.userName} \n${info.messageId}`
          );
        }

      })


      console.log(`Password Forgot by ${user.userName}`);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error!"
    })
  }

  res.status(200).json({
    success: true,
    message: "Forget Password link Sent Successfully ! "
  })


}

async function resetPassword(req, res) {
  const { resetPasswordToken } = req.params
  const { hashPassword } = req.body


  try {
    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user not found!"
      })
    }
    const password = await bcrypt.hash(hashPassword, 10)

    user.hashPassword = password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    res.status(200).json({
      success: true,
      message: "Password Changed Successfully!"
    })

    console.log(`Password changed by ${user.userName}`)

  } catch (error) {
    res.stutus(401).json({
      success: false,
      message: "reset password failed! "
    })
  }

}
export { register, verify, login, profile, logout, forgotPassword, resetPassword };
