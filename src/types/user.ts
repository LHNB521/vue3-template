export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}
