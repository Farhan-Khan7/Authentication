import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    userName : String,
    email : String,
    hashPassword : String,
    role : {
        type : String,
        enum : ["user" , "admin"],
        default : "user"
    },
    isVerified :{
        type : Boolean,
        default : false
    },
    emailVerficationToken : {
        type : String
    },
    resetPasswordToken : {
        type : String
    },
    resetPasswordExpires : {
        type : Date
    }

},
{
    timestamps : true
} )


const userModel = mongoose.model("User" , userSchema)


export default userModel