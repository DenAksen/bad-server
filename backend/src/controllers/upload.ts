import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    
    if (!req.file.filename) {
        return next(new BadRequestError('Ошибка сохранения файла'))
    }

    const minSize = 2 * 1024;     // 2 KB
    const maxSize = 10 * 1024 * 1024; // 10 MB
    
    // Проверка минимального размера
    if (req.file.size < minSize) {
        return next(new BadRequestError('Файл слишком маленький. Минимум 2KB'))
    }
    
    // Проверка максимального размера
    if (req.file.size > maxSize) {
        return next(new BadRequestError('Файл слишком большой. Максимум 5MB'))
    }
    
    try {
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}