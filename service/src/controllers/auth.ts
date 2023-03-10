import { users } from '../model'
import type { User } from '../model/helper'
import { generateToken, hashPassword, isAdmin, matchPassword } from '../utils/auth'
import { initFreeTrial } from '../utils/subscription'

function loginSuccess(user, ttl?) {
  return {
    code: 200,
    status: 'Success',
    message: 'Login success.',
    data: {
      user,
      token: generateToken(user, ttl),
    },
  }
}

const login = async (req, res) => {
  const { username, password = '' } = req.body as { username: string; password?: string }
  if (isAdmin(username, password)) {
    res.send(loginSuccess(username))
    return
  }

  if (await users.has(username)) {
    const { password: encoded } = await users.read(username)
    if (matchPassword(password, encoded)) {
      res.send(loginSuccess(username))
      return
    }
  }
  res.setHeader('Content-type', 'application/json')
  res.send(loginFailed(username))
}

const register = async (req, res) => {
  const { firstName, lastName, username, password = '' }: Partial<User> = req.body

  if (process.env.ADMIN_USER === username || await users.has(username)) {
    res.send(registerFailed({ username }, 'User already exists.'))
    return
  }

  await users.create(username, {
    password: hashPassword(password),
    firstName,
    lastName,
  })

  // update free trial
  await initFreeTrial(username)
  console.log(`Free trial inited for user ${username}`)

  res.send(registerSuccess({ username }))
}

function registerSuccess({ username }) {
  return {
    code: 200,
    status: 'Success',
    message: 'Register success.',
    data: {
      user: username,
      token: generateToken(username),
    },
  }
}

function registerFailed({ username }, reason) {
  return {
    code: 403,
    status: 'Fail',
    message: reason,
  }
}

function loginFailed(username: string): any {
  return {
    code: 401,
    status: 'Fail',
    message: `Login failed for user ${username}.`,
  }
}

export {
  login,
  register,
}
