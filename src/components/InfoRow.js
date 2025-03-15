import { View, Text } from 'react-native'

const InfoRow = ({ label, value, badge = false, col = false, color = "bg-green-500" }) => {
  return (
    <View className={`justify-between items-start py-3 gap-2 ${col ? 'flex-col' : 'flex-row'}`}>
      <Text className="text-gray-600">{label}</Text>
      {badge ? (
        <View className={`${color} px-3 py-1 rounded-full`}>
          <Text className="text-white text-sm">{value}</Text>
        </View>
      ) : (
        <Text className="text-gray-900 font-semibold">{value}</Text>
      )}
    </View>
  )
}

export default InfoRow