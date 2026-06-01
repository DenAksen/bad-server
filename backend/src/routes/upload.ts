import { Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware, { validateImageFile } from '../middlewares/file'
import { Role } from '../models/user'
import { roleGuardMiddleware } from '../middlewares/auth'

const uploadRouter = Router()
uploadRouter.post('/', fileMiddleware.single('file'), roleGuardMiddleware(Role.Admin), validateImageFile, uploadFile)

export default uploadRouter
