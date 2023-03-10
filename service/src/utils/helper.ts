import type { Role } from '../model/helper'

export interface AuthenticatedRequest extends Express.Request {
  auth: {
    token: string
    user: string
    role: Role
  }
}
