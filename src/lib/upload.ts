import path from 'node:path'
import { v2 as cloudinary } from 'cloudinary'
import type { Request } from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import 'dotenv/config'
import { CustomValidationError } from './Error'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
})

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
})

const fileFilter = (_: Request, file: Express.Multer.File, callback: any) => {
  const validFormat = ['.jpg', '.png', '.jpeg']
  const { mimetype } = file
  const fileFormat = path.extname(file.originalname.toLowerCase())

  if (validFormat.includes(fileFormat) && mimetype.includes('image')) {
    return callback(null, true)
  }
  console.log(file)

  return callback(
    new CustomValidationError(
      'invalid file format, please only upload file with .png or .jpg extension',
      file.fieldname,
    ),
    false,
  )
}

export default multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: { fileSize: 1048576 /* 1MB */ },
})
