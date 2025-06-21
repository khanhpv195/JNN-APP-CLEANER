import { POST, GET } from './fetch'

const userApis = {
  getUser: () => {
    return POST('/getUser')
  },

  getUsers: () => {
    return POST('/getUsers')
  },

  createUser: (userData) => {
    return POST('/createUser', { body: userData })
  },

  forgotPassword: (email) => {
    return POST('/forgotPassword', { body: { email } })
  },

  resetPassword: (password, token) => {
    return POST('/resetPassword', { body: { password, token } })
  },

  deleteUser: (userId) => {
    return POST('/deleteUser', { body: { userId } })
  },

  changePassword: (oldPassword, newPassword) => {
    return POST('/changePassword', { body: { oldPassword, newPassword } })
  }
}

export default userApis
