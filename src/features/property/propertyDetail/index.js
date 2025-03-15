import { useCallback, useMemo, useState, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import {
  UserIcon,
  WrenchIcon,
  XMarkIcon,
  PlusIcon
} from "react-native-heroicons/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "react-native-heroicons/solid";
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

// hooks
import { useGetPropertyDetail, useUpdateProperty } from '@/hooks/useProperty'
import { useRoute } from '@react-navigation/native';

// components
import Loading from '@/components/ui/Loading';
import Detail from './components/detail';
import Checklist from './components/checklist';
import CommonProblem from './components/commonProblem';
import Notes from './components/notes';
import EditableContent from "@/components/EditableContent";

export default function DetailPropertyComponent() {
  const { t } = useTranslation();
  const navigatesBtn = [
    t('navigation.overview'),
    t('navigation.details'),
    t('navigation.checklist'),
    t('navigation.notes'),
    t('navigation.commonProblems'),
    t('navigation.problems')
  ];

  const [btnIndex, setBtnIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const route = useRoute();
  const { id } = route.params;

  const { property, isLoading, setFetching } = useGetPropertyDetail({ propertyId: id })
  const { updateProperty, addNote } = useUpdateProperty();

  const checklistRef = useRef(null);

  if (isLoading) {
    return <Loading />
  }

  const handleImagePress = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const handleNextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Function to get the title based on current tab
  const getTabTitle = () => {
    switch (btnIndex) {
      case 0:
        return t('property.aboutThisProperty', "About this property");
      case 1:
        return t('navigation.details');
      case 2:
        return t('navigation.checklist');
      case 3:
        return t('navigation.notes');
      case 4:
        return t('navigation.commonProblems');
      case 5:
        return t('navigation.problems');
      default:
        return t('property.aboutThisProperty', "About this property");
    }
  };

  // Function to render the add button for specific tabs
  const renderAddButton = () => {
    if (btnIndex === 2) { // Checklist tab
      return (
        <TouchableOpacity
          className="flex-row items-center bg-green-500 px-3 py-2 rounded-lg"
          onPress={() => {
            if (checklistRef.current) {
              checklistRef.current.setShowAddModal(true);
            }
          }}
        >
          <PlusIcon size={16} color="white" />
          <Text className="text-white font-medium ml-1">{t('actions.addNew', 'Add New')}</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Function to handle property updates
  const handlePropertyUpdate = async (field, value) => {
    if (!property || !property._id) return Promise.reject(new Error('Property not found'));

    // Tạo đối tượng data với trường cần cập nhật
    const data = {};

    // Xử lý trường hợp nested fields (ví dụ: 'problems.description')
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      data[parent] = {
        ...(property[parent] || {}),
        [child]: value
      };
    } else {
      data[field] = value;
    }

    try {
      // Gọi API để cập nhật property
      const response = await updateProperty(property._id, data);

      // Refresh data
      setFetching(prev => !prev);

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Property updated successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });

      return response;
    } catch (error) {
      console.error('Error updating property:', error);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update property',
        position: 'bottom',
        visibilityTime: 3000,
      });

      throw error;
    }
  };

  // Function to handle adding a note
  const handleAddNote = async (content) => {
    if (!property || !property._id) return Promise.reject(new Error('Property not found'));

    try {
      // Gọi API để thêm note
      const response = await addNote(property._id, { content });

      // Refresh data
      setFetching(prev => !prev);

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Note added successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });

      return response;
    } catch (error) {
      console.error('Error adding note:', error);

      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add note',
        position: 'bottom',
        visibilityTime: 3000,
      });

      throw error;
    }
  };

  // Refactor the detailProperty function to avoid duplicate rendering
  const renderTabContent = () => {
    switch (btnIndex) {
      case 0: // Overview
        return (
          <View>
            <EditableContent
              title={t('property.summary', 'Summary')}
              content={property?.summary}
              onSave={(value) => handlePropertyUpdate('summary', value)}
              placeholder={t('property.enterSummary', 'Enter property summary...')}
            />

            <EditableContent
              title={t('property.description', 'Description')}
              content={property?.description}
              onSave={(value) => handlePropertyUpdate('description', value)}
              placeholder={t('property.enterDescription', 'Enter property description...')}
            />
          </View>
        );

      case 1: // Detail
        return <Detail detail={property?.detail} onUpdate={handlePropertyUpdate} />;

      case 2: // Checklist
        return (
          <Checklist
            ref={checklistRef}
            checklist={property?.check_list}
            onUpdate={handlePropertyUpdate}
          />
        );

      case 3: // Problems
        return <Notes notes={property?.notes} onAddNote={handleAddNote} />;



      case 4: // Common Problems
        return <CommonProblem commonProblems={property?.common_problems} onUpdate={handlePropertyUpdate} />;

      case 5: // Notes
        return (
          <View>
            <EditableContent
              title={t('property.problemsDescription', 'Problems Description')}
              content={property?.problems?.description}
              onSave={(value) => handlePropertyUpdate('problems.description', value)}
              placeholder={t('property.enterProblemsDescription', 'Enter problems description...')}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Property Info Card */}
        <View className="p-4">
          <Text className="text-xl font-bold mb-4">{property?.name}</Text>

          {/* Basic Info Card */}
          <View className="bg-white rounded-xl overflow-hidden mb-6 border border-gray-200">
            <View className="divide-y divide-gray-200">
              {property?.accessCode && (
                <View className="flex-row justify-between py-4 px-4">
                  <Text className="text-gray-600">{t('property.accessCode', 'Access Code')}</Text>
                  <Text className="font-medium">{property?.accessCode}</Text>
                </View>
              )}
              {property?.propertyType && (
                <View className="flex-row justify-between py-4 px-4">
                  <Text className="text-gray-600">{t('property.propertyType', 'Property type')}</Text>
                  <Text className="font-medium capitalize">{property?.propertyType}</Text>
                </View>
              )}
              <View className="flex-row justify-between items-center py-4 px-4">
                <Text className="text-gray-600">{t('property.status', 'Status')}</Text>
                <View className={`${property?.listed === true ? 'bg-green-500' : 'bg-orange-400'} px-3 py-1 rounded-full`}>
                  <Text className="text-white capitalize">{property?.listed ? t('property.listed', 'Listed') : t('property.unlisted', 'Unlisted')}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Assigned To Section */}
          <Text className="text-lg font-semibold mb-3">{t('property.assignedTo', 'Assigned To')}</Text>
          <View className="bg-white rounded-xl overflow-hidden mb-6 border border-gray-200">
            {/* Cleaner Info */}
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <View className="bg-green-100 rounded-full p-2 mr-3">
                  <UserIcon color={'#22c55e'} size={20} />
                </View>
                <View>
                  <Text className="font-medium">{t('property.cleaner', 'Cleaner')}</Text>
                  <Text className="text-gray-600">
                    {property?.assignedTo?.cleaner?.fullName || t('property.noAssigned', 'No assigned')}
                    {property?.assignedTo?.cleaner?.phone && ` - ${property?.assignedTo?.cleaner?.phone}`}
                  </Text>
                </View>
              </View>
            </View>

            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <View className="bg-green-100 rounded-full p-2 mr-3">
                  <WrenchIcon color={'#22c55e'} size={20} />
                </View>
                <View>
                  <Text className="font-medium">{t('property.maintenance', 'Maintenance')}</Text>
                  <Text className="text-gray-600">
                    {property?.assignedTo?.maintenance?.fullName || t('property.noAssigned', 'No assigned')}
                    {property?.assignedTo?.maintenance?.phone && ` - ${property?.assignedTo?.maintenance?.phone}`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Lead Info */}
            <View className="p-4">
              <View className="flex-row items-center">
                <View className="bg-blue-100 rounded-full p-2 mr-3">
                  <UserIcon color={'#3b82f6'} size={20} />
                </View>
                <View>
                  <Text className="font-medium">{t('property.lead', 'Customer')}</Text>
                  <Text className="text-gray-600">
                    {property?.leadName || t('property.noAssigned', 'No assigned')}
                    {property?.leadPhone && ` - ${property?.leadPhone}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tab Navigation */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {navigatesBtn.map((btn, index) => (
                <TouchableOpacity
                  key={index}
                  className={`px-5 py-3 mr-2 rounded-full ${btnIndex === index ? 'bg-black' : 'bg-white border border-gray-200'}`}
                  onPress={() => setBtnIndex(index)}
                >
                  <Text className={`${btnIndex === index ? 'text-white' : 'text-gray-700'} font-medium`}>
                    {btn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Property Images - Only show in Overview tab */}
          {btnIndex === 0 && property?.images && property.images.length > 0 && (
            <View className="flex-row flex-wrap mb-6">
              {property.images.slice(0, 2).map((image, index) => (
                <TouchableOpacity
                  key={image._id || index}
                  className={`${index === 0 ? 'w-1/2 pr-1' : 'w-1/2 pl-1'} mb-2`}
                  onPress={() => handleImagePress(index)}
                >
                  <Image
                    source={{ uri: image.url }}
                    className="h-48 rounded-lg"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Dynamic title based on current tab with Add button */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">{getTabTitle()}</Text>
            {renderAddButton()}
          </View>

          {/* Tab Content in a card */}
          <View className="bg-white rounded-xl overflow-hidden border border-gray-200 p-4 mb-6">
            {renderTabContent()}
          </View>
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
          <TouchableOpacity
            className="absolute top-10 right-5 z-10 bg-gray-800 rounded-full p-2"
            onPress={() => setShowImageModal(false)}
          >
            <XMarkIcon color="white" size={24} />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between w-full px-4">
            <TouchableOpacity className="p-2" onPress={handlePrevImage}>
              <ChevronLeftIcon color="white" size={30} />
            </TouchableOpacity>

            <Image
              source={{ uri: property?.images?.[currentImageIndex]?.url }}
              style={{ width: screenWidth * 0.8, height: screenHeight * 0.6 }}
              resizeMode="contain"
            />

            <TouchableOpacity className="p-2" onPress={handleNextImage}>
              <ChevronRightIcon color="white" size={30} />
            </TouchableOpacity>
          </View>

          <View className="bg-gray-800 px-3 py-1 rounded-full mt-4">
            <Text className="text-white">
              {currentImageIndex + 1} / {property?.images?.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}