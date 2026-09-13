import express from 'express';
import { register , verify , login , profile } from '../controller/auth.controller.js';
const router = express.Router()


router.post('/register' ,register )
router.get('/verify/:emailVerficationToken' , verify)
router.post('/login' , login)
router.get('/profile' , profile)



export default router