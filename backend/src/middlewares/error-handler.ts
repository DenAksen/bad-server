import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    const statusCode = err.statusCode || 500
    const isProduction = process.env.NODE_ENV === 'production'

    let {message} = err
    if (isProduction && statusCode === 500) {
        message = 'На сервере произошла ошибка'
    }
    
    if (isProduction) {
        console.error(`[ERROR] ${statusCode}: ${err.message}`)
    } else {
        console.error(err)
    }

    res.status(statusCode).json({ 
        message,
        ...(isProduction ? {} : { stack: err.stack })
    })
    
    next()
}

export default errorHandler