import { expressjwt } from 'express-jwt'
import jwt from 'jsonwebtoken'

let jwtSecret = ''
// JWT related
if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0)
  jwtSecret = process.env.JWT_SECRET

const authenticate = expressjwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
})

function generateToken(user) {
  return jwt.sign({ user }, jwtSecret, { expiresIn: 60 * 60 * 24 * 100 })
}

function isAdmin(username, password) {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD)
    return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD

  return false
}

export {
  authenticate,
  generateToken,
  isAdmin,
}
