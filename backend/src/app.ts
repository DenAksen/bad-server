import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { doubleCsrf } from 'csrf-csrf'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())

app.use(helmet({
    strictTransportSecurity: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    }
}))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Слишком много запросов, попробуйте позже'
})
app.use(limiter)

const corsOptions = {
    origin: ORIGIN_ALLOW?.split(',') || ['http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

app.use(express.static(path.join(__dirname, 'public'), {
    dotfiles: 'deny',
    index: false,
    fallthrough: true,
    maxAge: '1d',
    setHeaders: (res, _filePath) => {
        // Дополнительно
        res.setHeader('X-Content-Type-Options', 'nosniff')
    }
}))

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

// ЗАЩИТА ОТ NoSQL ИНЪЕКЦИЙ
app.use(mongoSanitize())

const csrfSecret = process.env.CSRF_SECRET || 'csrf-dev'

const {
    doubleCsrfProtection,
    generateCsrfToken,
} = doubleCsrf({
    getSecret: () => csrfSecret,
    cookieName: 'csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
    },
    getSessionIdentifier: () => 'default',
    getCsrfTokenFromRequest: (req: any) => {
    // Сначала из тела
    if (req.body?.csrfToken) return req.body.csrfToken
    // Потом из заголовка
    if (req.headers['x-csrf-token']) return req.headers['x-csrf-token']
    return ''
},
})

app.get('/csrf-token', (req, res) => {
    const token = generateCsrfToken(req, res);
    res.json({ csrfToken: token });
});

const csrfExcludedPaths = [
    '/api/auth/login',
    '/api/auth/register'
]

app.use((req, res, next) => {
    // Пропускаем загрузку файлов без CSRF
    if (req.method === 'POST' && req.path === '/upload') {
        return next()
    }
    if (csrfExcludedPaths.includes(req.path)) {
        return next()
    }
    // Для всех остальных запросов применяем CSRF защиту
    doubleCsrfProtection(req, res, next)
})

app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()