import { View } from 'react-native'

import InfoRow from '@/components/InfoRow'

const Activities = ({ email, createdAt, state }) => {
  return (
    <View>
      <View className="border border-neutral-200 rounded-2xl px-4 divide-y divide-neutral-200 mb-5">
        <InfoRow label="Email" value={email} />
        <InfoRow label="Date" value={createdAt} />
        <InfoRow label="State" value={state} badge color={'bg-blue-500'} />
      </View>
    </View>
  )
}

export default Activities