import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'

const authRouter = Router()

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
})

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 9,
    message: 'Слишком много попыток регистрации. Попробуйте через час.'
})

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login',loginLimiter, login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register',registerLimiter, register)

export default authRouter
