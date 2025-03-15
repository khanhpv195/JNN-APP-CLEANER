import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { UserIcon } from "react-native-heroicons/outline";
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

import { convertDate } from "@/utils";
import { Colors } from '@/shared/constants/colors';

import { useCreateLeadNote } from "@/hooks/useLead";

const Notes = ({ leadId, notes, refetch }) => {
  const [inputVl, setInputVl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createNote, isLoading: isNoteLoading } = useCreateLeadNote();

  // Get current user from Redux store
  const currentUser = useSelector(state => state.auth.user);


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

      // Prepare the note data as specified
      const noteData = {
        leadId: leadId,
        content: inputVl,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?._id,
        userId: currentUser?._id
      };

      console.log("Creating note with data:", noteData);

      // Call the create note API using the hook function
      await createNote(noteData);

      // Clear input and refresh lead data to get updated notes
      setInputVl('');
      if (refetch) refetch();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Note added successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error adding note:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add note',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
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
            editable={!isLoading && !isNoteLoading}
          />
        </View>
        <View className="flex-row justify-end">
          <TouchableOpacity
            onPress={handleAddNote}
            className={`rounded-xl ${(isLoading || isNoteLoading) ? 'bg-green-400' : 'bg-green-500'} px-4 py-2`}
            disabled={isLoading || isNoteLoading}
          >
            {(isLoading || isNoteLoading) ? (
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
        // Sort notes by createdAt in descending order (newest first)
        [...notes]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((note, index) => (
            <View key={note?._id || index} className="border border-gray-200 divide-y divide-gray-200 px-5 rounded-2xl bg-white mb-4">
              <View className="flex-row justify-between items-center py-4">
                <View className="flex-row gap-2 items-center justify-start">
                  <View className="bg-green-100 rounded-full p-1.5">
                    <UserIcon color={Colors.primary} size={16} className="font-bold" />
                  </View>
                  <Text className="font-semibold capitalize">{note?.createdBy?.email || 'User'}</Text>
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

      <Toast />
    </View>
  );
};

export default Notes;