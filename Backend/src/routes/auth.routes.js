import express from 'express';
import { register , verify , login } from '../controller/auth.controller.js';
const router = express.Router()


router.post('/register' ,register )
router.get('/verify/:emailVerficationToken' , verify)
router.post('/login' , login)



export default router