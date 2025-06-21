import { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native'

import SendEmail from './components/SendEmail'
import SendPassword from './components/SendPassword'

const ForgotPasswordComponent = () => {
  const [isSwitch, setIsSwitch] = useState(false)

  return (
    <View style={{/* was: className="w-[85%] max-w-[400px]" */}}>
      {
        !isSwitch ? <SendEmail setIsSwitch={setIsSwitch} /> : <SendPassword />
      }
    </View>
  )
}

export default ForgotPasswordComponent