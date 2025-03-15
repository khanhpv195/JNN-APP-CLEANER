import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native'
import { format, isToday, isYesterday } from 'date-fns'

import NavigationService from '@/navigation/NavigationService'

const MessageItem = ({ message }) => {
  const { latest_message, is_read } = message;
  // Log để kiểm tra trạng thái tin nhắn
  console.log('Message item:', message.conversation_id, 'is_read:', is_read);

  // Format the timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <TouchableOpacity
      onPress={() => NavigationService.navigate('chat', { 
        messages: message?.messages,
        reservationId: message?.reservationId,
        guestId: message?.guest?._id || latest_message?.sender?._id
      })}
      style={[styles.container, !is_read && styles.unreadContainer]}
    >
      {/* Avatar with Online Status */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: latest_message?.sender?.avatar || latest_message?.avatar }}
          style={styles.avatar}
        />
        <View style={styles.onlineIndicator} />
      </View>

      {/* Message Content */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.senderName, !is_read && styles.unreadText]}>
            {latest_message?.sender?.full_name}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(latest_message?.created_at)}
          </Text>
        </View>
        <Text 
          style={[styles.messageText, !is_read && styles.unreadText]} 
          numberOfLines={1}
        >
          {latest_message?.body || (latest_message?.attachments?.length > 0 ? "📷 Image" : "")}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  unreadContainer: {
    backgroundColor: '#f0f7ff'
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white'
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  senderName: {
    fontSize: 16,
    color: '#111827'
  },
  unreadText: {
    fontWeight: 'bold'
  },
  timestamp: {
    fontSize: 14,
    color: '#6b7280'
  },
  messageText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  }
});

export default MessageItem