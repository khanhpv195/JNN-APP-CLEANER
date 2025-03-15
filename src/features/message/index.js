import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon
} from "react-native-heroicons/outline";

import NotFoundImage from '../../../assets/images/Not_found.png';
import { Colors } from '@/shared/constants/colors';

import { useGetMessage } from '@/hooks/useGetMessage';
import { useMarkAllMessagesAsRead } from '@/shared/api/messageApis';

// components
import MessageItem from './components/messageItem';
import Loading from '@/components/ui/Loading';


export default function MessageComponent() {
  const { messages, isLoading, refetch } = useGetMessage();
  const { mutateAsync: markAllAsRead } = useMarkAllMessagesAsRead();
  const [refreshing, setRefreshing] = React.useState(false);

  // Đánh dấu tất cả tin nhắn là đã đọc khi component khởi tạo lần đầu
  useEffect(() => {
    // Bật đoạn này nếu muốn tự động đánh dấu tất cả tin nhắn là đã đọc khi mở app
    // Vì yêu cầu mặc định tin nhắn hiện có là đã đọc, nên bật tính năng này
    markAllAsRead().then(() => refetch());
  }, []);

  // Hàm kéo để làm mới
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Hàm đánh dấu tất cả tin nhắn là đã đọc và tải lại danh sách
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await refetch();
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {
        isLoading && !refreshing ?
          <Loading />
          :
          <View className="flex-1">
            {/* Search Bar và Refresh Button */}
            <View className="py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center bg-gray-50 rounded-lg px-4 flex-1 mr-2">
                  <MagnifyingGlassIcon size={20} color={Colors.primary} />
                  <TextInput
                    className="flex-1 py-3 px-2 text-gray-900 outline-none"
                    placeholder="Search"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                
                <TouchableOpacity 
                  onPress={handleMarkAllAsRead}
                  className="bg-blue-50 p-2 rounded-lg"
                >
                  <ArrowPathIcon size={24} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {messages && messages.length ?
              <ScrollView 
                className="flex-1"
                refreshControl={
                  <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    colors={[Colors.primary]}
                    tintColor={Colors.primary}
                  />
                }
              >
                {messages.map((message, index) => (
                  <MessageItem key={index} message={message} />
                ))}
              </ScrollView>
              :
              <View className="flex-1 items-center justify-center">
                <View className="items-center space-y-2">
                  <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center">
                    <Image source={NotFoundImage} />
                  </View>
                  <Text className="text-gray-400 text-lg pt-10">No messages yet!</Text>
                </View>
              </View>
            }
          </View>
      }
    </View>
  );
}