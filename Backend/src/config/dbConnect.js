import mongoose from "mongoose";
import config from "./config.js";


const connectToDB = async () => {
    await mongoose.connect(config.MONGO_URI).then(() => {
        console.log("DataBase Connected Successfully!")
    }).
    catch((error) => {
        console.log(`DataBase not Connected ${error}`)
    })
}


export default connectToDB