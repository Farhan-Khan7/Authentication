import express from 'express';
import { register , verify , login , profile, logout, forgotPassword , resetPassword } from '../controller/auth.controller.js';
import { isLoggedIn } from '../middleware/auth.middleware.js'
const router = express.Router()


router.post('/register' ,register )
router.get('/verify/:emailVerficationToken' , verify)
router.post('/login' , login)
router.get('/profile' , isLoggedIn , profile)
router.post('/logout', isLoggedIn , logout)
router.post('/forgetpassword' , forgotPassword)
router.post('/resetpassword/:resetPasswordToken' , resetPassword)



export default router