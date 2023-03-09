import type { Request } from 'express-jwt'
import type { Role } from '../model/helper'

export interface AuthenticatedRequest extends Request {
  auth: {
    token: string
    user: string
    role: Role
  }
}
