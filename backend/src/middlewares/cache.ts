import { Request, Response, NextFunction } from 'express'

export const cacheControl = (duration: number) => (_req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Cache-Control', `public, max-age=${duration}`)
        next()
    }

export const noCache = (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate')
    next()
}