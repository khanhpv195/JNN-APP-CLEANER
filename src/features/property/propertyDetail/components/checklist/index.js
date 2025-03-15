import { useState, forwardRef, useImperativeHandle } from "react"
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator } from "react-native"
import { ClipboardDocumentCheckIcon, PlusIcon, XMarkIcon, CheckIcon } from "react-native-heroicons/outline"
import Toast from 'react-native-toast-message';

const Checklist = forwardRef(({ checklist, onUpdate }, ref) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [checklistTitle, setChecklistTitle] = useState("");
  const [checklistItems, setChecklistItems] = useState([""]);
  const [isLoading, setIsLoading] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setShowAddModal
  }));

  const handleAddItem = () => {
    setChecklistItems([...checklistItems, ""]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...checklistItems];
    newItems.splice(index, 1);
    setChecklistItems(newItems);
  };

  const handleItemChange = (text, index) => {
    const newItems = [...checklistItems];
    newItems[index] = text;
    setChecklistItems(newItems);
  };

  const handleSaveChecklist = async () => {
    if (!checklistTitle.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a checklist title',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }

    // Filter out empty items
    const filteredItems = checklistItems.filter(item => item.trim() !== "");

    if (filteredItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please add at least one checklist item',
        position: 'bottom',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create new checklist object
      const newChecklist = {
        title: checklistTitle,
        items: filteredItems
      };

      // Get existing checklists or initialize empty array
      const existingChecklists = Array.isArray(checklist) ? [...checklist] : [];

      // Add new checklist to existing ones
      const updatedChecklists = [...existingChecklists, newChecklist];

      // Call the update function passed from parent
      if (onUpdate) {
        await onUpdate('check_list', updatedChecklists);

        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Checklist added successfully',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }

      // Reset form and close modal
      setChecklistTitle("");
      setChecklistItems([""]);
      setShowAddModal(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving checklist:', error);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add checklist',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <View className="bg-white border border-neutral-200 rounded-2xl px-5 py-2">
      {checklist && checklist.length > 0 ? (
        <FlatList
          data={checklist}
          renderItem={({ item }) => (
            <View className="py-2">
              <View className="flex-row justify-start items-center gap-2 mb-1">
                <ClipboardDocumentCheckIcon size={16} color={'#22c55e'} />
                <Text className="capitalize font-medium">{item?.title}</Text>
              </View>
              <View className="ml-6">
                {item?.items.map((el, idx) => (
                  <Text key={idx} className="capitalize py-1 text-gray-700">• {el}</Text>
                ))}
              </View>
            </View>
          )}
          keyExtractor={(item, index) => item._id || index.toString()}
        />
      ) : (
        <Text className="text-gray-500 py-4 text-center">No checklists available</Text>
      )}

      {/* Add Checklist Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isLoading && setShowAddModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-gray-50 rounded-t-3xl p-5 h-4/5">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Add New Checklist</Text>
              <TouchableOpacity
                className="bg-green-500 p-2 rounded-full"
                onPress={() => !isLoading && setShowAddModal(false)}
                disabled={isLoading}
              >
                <XMarkIcon size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Checklist Title Input */}
            <View className="mb-6">
              <TextInput
                className="bg-white border border-gray-300 rounded-xl p-4 text-base"
                placeholder="Enter checklist title"
                value={checklistTitle}
                onChangeText={setChecklistTitle}
                editable={!isLoading}
              />
            </View>

            {/* Checklist Items */}
            <Text className="text-lg font-semibold mb-3">Checklist Items</Text>

            {checklistItems.map((item, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <View className="flex-row items-center flex-1 bg-white border border-gray-300 rounded-xl p-2 mr-2">
                  <CheckIcon size={20} color="#22c55e" className="mr-2" />
                  <TextInput
                    className="flex-1 p-2 text-base"
                    placeholder="Enter checklist item"
                    value={item}
                    onChangeText={(text) => handleItemChange(text, index)}
                    editable={!isLoading}
                  />
                </View>
                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleRemoveItem(index)}
                  disabled={isLoading}
                >
                  <XMarkIcon size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Item Button */}
            <TouchableOpacity
              className="flex-row items-center mb-6"
              onPress={handleAddItem}
              disabled={isLoading}
            >
              <View className="bg-green-500 rounded-full p-1 mr-2">
                <PlusIcon size={16} color="white" />
              </View>
              <Text className="text-green-500 font-medium">Add Item</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View className="flex-row justify-end mt-auto">
              <TouchableOpacity
                className="flex-row items-center justify-center bg-red-500 px-6 py-3 rounded-xl mr-3"
                onPress={() => !isLoading && setShowAddModal(false)}
                disabled={isLoading}
              >
                <XMarkIcon size={20} color="white" />
                <Text className="text-white font-medium ml-2">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center justify-center ${isLoading ? 'bg-green-400' : 'bg-green-500'} px-6 py-3 rounded-xl`}
                onPress={handleSaveChecklist}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CheckIcon size={20} color="white" />
                )}
                <Text className="text-white font-medium ml-2">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
})

export default Checklist
