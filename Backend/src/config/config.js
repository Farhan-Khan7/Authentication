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
    JWT_SECRET : process.env.JWT_SECRET
}

export default config