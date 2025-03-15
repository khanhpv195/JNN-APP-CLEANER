import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { UserIcon } from "react-native-heroicons/outline";
import Toast from 'react-native-toast-message';

import { convertDate } from "@/utils";
import { Colors } from '@/shared/constants/colors';

const Notes = ({ notes, onAddNote }) => {
  const [inputVl, setInputVl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNote = async () => {
    if (!inputVl.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a note',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      setIsLoading(true);
      // Gọi API để thêm note
      await onAddNote(inputVl);
      setInputVl('');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error adding note:', error);
    }
  };

  return (
    <View>
      <View className="mb-4">
        <Text className="font-semibold text-lg capitalize mb-2">Notes</Text>
        <View className="mb-2">
          <TextInput
            onChangeText={setInputVl}
            value={inputVl}
            className="border border-neutral-200 p-4 rounded-2xl bg-white"
            placeholder="Enter your note here..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>
        <View className="flex-row justify-end">
          <TouchableOpacity
            onPress={handleAddNote}
            className={`rounded-xl ${isLoading ? 'bg-green-400' : 'bg-green-500'} px-4 py-2`}
            disabled={isLoading}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-medium ml-2">Adding...</Text>
              </View>
            ) : (
              <Text className="text-white font-medium">Add Note</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {notes && notes.length > 0 ? (
        notes.map(note => (
          <View key={note?._id} className="border border-gray-200 divide-y divide-gray-200 px-5 rounded-2xl bg-white mb-4">
            <View className="flex-row justify-between items-center py-4">
              <View className="flex-row gap-2 items-center justify-start">
                <View className="bg-green-100 rounded-full p-1.5">
                  <UserIcon color={Colors.primary} size={16} className="font-bold" />
                </View>
                <Text className="font-semibold capitalize">{note?.createdBy?.email}</Text>
              </View>
              <Text>{convertDate(note?.createdAt)}</Text>
            </View>
            <Text className="text-gray-600 text-sm py-4">
              {note?.content}
            </Text>
          </View>
        ))
      ) : (
        <Text className="text-gray-500 text-center py-4">No notes available</Text>
      )}
    </View>
  );
};

export default Notes;
