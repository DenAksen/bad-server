import { Request, Express, NextFunction, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { mkdirSync, promises as fs } from 'fs';
import sharp from 'sharp';
import path, { join } from 'path';
import crypto from 'crypto';

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const destinationPath = join(
            __dirname,
            process.env.UPLOAD_PATH_TEMP
                ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                : '../public'
        )

        mkdirSync(destinationPath, { recursive: true })
        cb(null, destinationPath)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const ext = path.extname(file.originalname)
        const safeName = crypto.randomBytes(16).toString('hex') + ext
        cb(null, safeName)
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(null, false)
    }
    return cb(null, true)
}

export const validateImageFile = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();
    
    const filePath = path.join(req.file.destination, req.file.filename);
    
    try {
        const metadata = await sharp(filePath).metadata();
        
        if (!metadata.width || !metadata.height) {
            await fs.unlink(filePath);
            return res.status(400).json({ error: 'Invalid image file' });
        }
        
        next();
    } catch (error) {
        await fs.unlink(filePath);
        return res.status(400).json({ error: 'Invalid image file' });
    }
};

export default multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
    }
})