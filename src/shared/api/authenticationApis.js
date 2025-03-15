import { POST } from './fetch'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { navigationRef } from '../../navigation/NavigationService'

const authenticationApis = {
  login: (credentials) => {
    return POST('/login', {
      body: credentials,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
  
  loginWithDevice: (credentials) => {
    return POST('/login', {
      body: credentials,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },

  forgotPassword: ({ email }) => {
    return POST('/forgotPassword', { body: { email } })
  },

  logout: () => {
    return POST('/logout')
  },
}

// React Query hooks
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await authenticationApis.login(credentials)
      // Store token in AsyncStorage
      if (response.token) {
        await AsyncStorage.setItem('accessToken', response.token)
      }
      return response
    },
    onSuccess: () => {
      // Invalidate relevant queries after login
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email) => authenticationApis.forgotPassword({ email }),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await authenticationApis.logout()
      // Clear token from AsyncStorage
      await AsyncStorage.removeItem('accessToken')
      return response
    },
    onSuccess: () => {
      // Clear all queries from cache after logout
      queryClient.clear()
      // Navigate to login
      navigationRef.current?.navigate('Login')
    },
  })
}

export default authenticationApis
