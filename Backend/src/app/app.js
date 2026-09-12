import dotenv from "dotenv";
dotenv.config()
import express from "express";
import router from '../routes/auth.routes.js';
import cookieParser from 'cookie-parser'

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended : false}))


app.use('/auth/v1/api' , router)


export default app;