import dotenv from 'dotenv'
dotenv.config()

if(!process.env.MONGO_URI){
    console.log("MONGO DB URI is not Found in ENV file")
}

if(!process.env.PORT){
    console.log("Port Not Found in ENV File")
}


const config = {
    PORT : process.env.PORT,
    MONGO_URI : process.env.MONGO_URI,
    JWT_SECRET : process.env.JWT_SECRET,
    MAILTRAP_HOST : process.env.MAILTRAP_HOST,
    MAILTRAP_PORT : process.env.MAILTRAP_PORT,
    MAILTRAP_USER : process.env.MAILTRAP_USER,
    MAILTRAP_PASS : process.env.MAILTRAP_PASS,
    MAILTRAP_SENDEREMAIL : process.env.MAILTRAP_SENDEREMAIL,
    BASE_URL : process.env.BASE_URL
}

export default config