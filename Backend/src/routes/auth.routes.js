import express from 'express';
import { register , verify , login , profile } from '../controller/auth.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js'
const router = express.Router()


router.post('/register' ,register )
router.get('/verify/:emailVerficationToken' , verify)
router.post('/login' , login)
router.get('/profile' , isLoggedIn , profile)



export default router