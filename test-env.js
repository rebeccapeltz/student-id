require('dotenv').config()
const cloudinary = require('cloudinary').v2

if (
  typeof process.env.CLOUDINARY_URL === 'undefined' 
) {
  if (typeof process.env.CLOUDINARY_URL === 'undefined') {
    console.log('check CLOUDINARY_URL')
  }

  console.warn('Double Check environment variables')
} else {
  console.log('cloud name:', cloudinary.config().cloud_name)
  console.log('Good to Go')
}
