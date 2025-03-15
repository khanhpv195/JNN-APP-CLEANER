import { SafeAreaView } from 'react-native'
import ForgotPasswordComponent from '@/features/authentication/forgotPassword';

const ForgotPasswordScreen = () => {

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <ForgotPasswordComponent />
    </SafeAreaView>
  )
}

export default ForgotPasswordScreen