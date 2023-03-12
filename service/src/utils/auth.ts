import { expressjwt } from 'express-jwt'
import jwt from 'jsonwebtoken'
import { compareSync, hashSync } from 'bcrypt'
import { users } from '../model'
import { Role } from '../model/helper'
import processEnv from '@/env'

const saltRounds = 10
const authInfo = {
  userCount: 0,
  maxUserCount: isNaN(+processEnv.MAX_USER_COUNT) ? 10 : +processEnv.MAX_USER_COUNT,
  jwtResetTimestamp: 0,
}
let jwtSecret = 'default'
// JWT related
if (processEnv.JWT_SECRET && processEnv.JWT_SECRET.trim().length > 0)
  jwtSecret = processEnv.JWT_SECRET
const ADMIN_USERNAME = processEnv.ADMIN_USERNAME
const ADMIN_PASSWORD = processEnv.ADMIN_PASSWORD

const authenticate = expressjwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
})

function hashPassword(plainPassword: string) {
  return hashSync(plainPassword, saltRounds)
}

function matchPassword(plainPassword, hash) {
  return compareSync(plainPassword, hash)
}

function generateToken(user, ttl?) {
  return jwt.sign({ user }, jwtSecret, { expiresIn: ttl ?? 60 * 60 * 24 })
}

async function updateRootAdminUser() {
  // Get an iterator
  const iterator: AsyncGenerator<any, void, any> = users.iterator()

  // Iterate over the key-value pairs
  for await (const [key, value] of iterator) {
    // update all users without role to be Role.USER
    // console.log(`[Next User] ${key}: ${JSON.stringify(value)}`)
    // update user count
    authInfo.userCount++
    if ((value?.role === Role.ADMIN && key !== ADMIN_USERNAME) || !key) {
      users.delete(key)
      console.log(`deleting user ${key}`)
      authInfo.userCount--
    }

    if (!value.role) {
      users.update(key, { role: Role.USER })
      console.log(`updating role for user ${key}`)
    }
  }
  // create or update admin user
  if (!await users.read(ADMIN_USERNAME)) {
    authInfo.userCount++
    users.create(ADMIN_USERNAME, { password: hashPassword(ADMIN_PASSWORD!), role: Role.ADMIN })
  }
  else { users.update(ADMIN_USERNAME, { password: hashPassword(ADMIN_PASSWORD!), role: Role.ADMIN }) }
}
async function updateUser(user) {
  return users.update(user.id, { password: user.password })
}
async function isCurrentUserAdmin(req) {
  if (req.auth?.user && (await users.read(req.auth?.user)).role === Role.ADMIN)
    return true

  return false
}

function isAdmin(username, password) {
  if (ADMIN_USERNAME && ADMIN_PASSWORD)
    return username === processEnv.ADMIN_USERNAME && password === processEnv.ADMIN_PASSWORD

  return false
}

function generateRegex(a, prefix = '/api') {
  const regexStr = `^(${prefix})?/${a}`
  return new RegExp(regexStr)
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export {
  authenticate,
  generateToken,
  generateRegex,
  hashPassword,
  matchPassword,
  updateUser,
  updateRootAdminUser,
  isCurrentUserAdmin,
  isAdmin,
  authInfo,
  validateEmail,
}
