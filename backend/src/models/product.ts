import fs from 'fs'
import mongoose, { Document } from 'mongoose'
import path from 'path'

export interface IFile {
    fileName: string
    originalName: string
}

export interface IProduct extends Document {
    title: string
    image: IFile
    category: string
    description: string
    price: number
}

const cardsSchema = new mongoose.Schema<IProduct>(
    {
        title: {
            type: String,
            unique: true,
            required: [true, 'Поле "title" должно быть заполнено'],
            minlength: [2, 'Минимальная длина поля "title" - 2'],
            maxlength: [30, 'Максимальная длина поля "title" - 30'],
        },
        image: {
            fileName: {
                type: String,
                required: [true, 'Поле "image.fileName" должно быть заполнено'],
            },
            originalName: String,
        },
        category: {
            type: String,
            required: [true, 'Поле "category" должно быть заполнено'],
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            default: null,
        },
    },
    { versionKey: false }
)

cardsSchema.index({ title: 'text' })

cardsSchema.pre('findOneAndUpdate', async function deleteOldImage() {
    const update = this.getUpdate() as any
    const updateImage = update?.$set?.image || update?.image
    
    if (!updateImage) return
    
    const docToUpdate = await this.model.findOne(this.getQuery())
    if (!docToUpdate?.image?.fileName) return
    
    const safeFileName = path.basename(docToUpdate.image.fileName)
    const fullPath = path.join(__dirname, '../public', safeFileName)
    
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (!err) {
            fs.unlink(fullPath, (unlinkErr) => {
                if (unlinkErr) console.error('Ошибка удаления:', unlinkErr)
            })
        }
    })
})

cardsSchema.post('findOneAndDelete', async (doc: IProduct) => {
    if (!doc?.image?.fileName) return
    
    const safeFileName = path.basename(doc.image.fileName)
    const fullPath = path.join(__dirname, '../public', safeFileName)
    
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (!err) {
            fs.unlink(fullPath, (unlinkErr) => {
                if (unlinkErr) console.error('Ошибка удаления:', unlinkErr)
            })
        }
    })
})

export default mongoose.model<IProduct>('product', cardsSchema)
