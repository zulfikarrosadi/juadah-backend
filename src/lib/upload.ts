import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { Request } from 'express'
import multer from 'multer'

const PRODUCT_PHOTO = 'images'

const storage = multer.diskStorage({
  filename(_, file, callback) {
    const uniqueFilename = `${randomUUID()}${path.extname(file.originalname)}`
    callback(null, uniqueFilename)
  },
  destination(_, file, callback) {
    let dir: string
    switch (file.fieldname) {
      case PRODUCT_PHOTO:
        dir = path.join(__dirname, '../../public/img/product-photo')
        break
      default:
        dir = path.join(__dirname, '../../public/img')
        break
    }
    callback(null, dir)
  },
})

const fileFilter = (_: Request, file: Express.Multer.File, callback: any) => {
  const validFormat = ['.jpg', '.png', '.jpeg']
  const { mimetype } = file
  const fileFormat = path.extname(file.originalname.toLowerCase())

  if (validFormat.includes(fileFormat) && mimetype.includes('image')) {
    return callback(null, true)
  }

  return callback(
    new Error(
      'invalid file format, please only upload file with .png or .jpg extension',
    ),
    false,
  )
}

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 1048576 /* 1MB */ },
})
