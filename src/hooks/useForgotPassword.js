import { useState } from "react"

import userApis from "@/shared/api/userApis"
import NavigationService from "@/navigation/NavigationService"

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (password, cfPassword, token='') => {
    try{
      setIsLoading(true)

      if(password !== cfPassword) {
        return setErrorMsg('Password is not match!')
      }

      const res = await userApis.forgotPassword(password, token)
      if(!res.success) {
        return setErrorMsg(res?.message || 'Change password failed')
      }

      NavigationService.navigate('Login')

    } catch(err) {
      console.log(err)
      setErrorMsg(err?.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    onSubmit,
    isLoading,
    errorMsg,
    setErrorMsg
  }
}

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (email, setIsSwitch) => {
    try{
      setIsLoading(true)

      if(!email && email.trim() == '') {
        return setErrorMsg('Please, enter your email!')
      }

      const res = await userApis.forgotPassword(email)
      if(!res.success) {
        return setErrorMsg(res?.message || 'Send email failed')
      }

      setIsSwitch(true)
    } catch(err) {
      console.log(err)
      setErrorMsg(err?.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    onSubmit,
    isLoading,
    errorMsg,
    setErrorMsg
  }
}