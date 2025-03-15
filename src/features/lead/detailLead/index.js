import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native'
import { PhoneIcon, PencilIcon, TrashIcon } from 'react-native-heroicons/outline';
import Toast from 'react-native-toast-message';

import { useGetLeadDetail, useDeleteLead } from '@/hooks/useLead'
import { useRoute, useNavigation } from '@react-navigation/native';

// components
import Loading from '@/components/ui/Loading'
import BottomNavigation from '@/components/ui/BottomNavigation'
import OverView from './components/overview'
import Activities from './components/activities'
import Notes from './components/notes'
import InfoRow from '@/components/InfoRow'

import NavigationService from '@/navigation/NavigationService'

// Handle opening Aircall app with phone number
const handleAircallOpen = (phoneNumber) => {
  if (!phoneNumber) return;

  // Clean phone number - keep only digits and +
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');


  // Try multiple URL schemes for Aircall
  const aircallUrls = [
    `aircall://call/${cleanedNumber}`,
    `aircall:${cleanedNumber}`,
    `tel:${cleanedNumber}`  // Fallback to standard phone dialer
  ];


  // Try each URL scheme in sequence
  const tryOpenUrl = (urls, index) => {
    if (index >= urls.length) {
      console.log('All URL schemes failed, showing info toast');
      Toast.show({
        type: 'info',
        text1: 'Aircall Not Installed',
        text2: 'Would you like to download Aircall?',
        onPress: () => Linking.openURL('https://aircall.io/download'),
        topOffset: 50,
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    const currentUrl = urls[index];
    console.log(`Trying URL scheme: ${currentUrl}`);

    Linking.canOpenURL(currentUrl)
      .then(supported => {
        if (supported) {
          console.log(`URL scheme ${currentUrl} is supported, opening...`);
          return Linking.openURL(currentUrl);
        } else {
          console.log(`URL scheme ${currentUrl} is not supported, trying next...`);
          tryOpenUrl(urls, index + 1);
        }
      })
      .catch(error => {
        console.error(`Error with URL scheme ${currentUrl}:`, error);
        tryOpenUrl(urls, index + 1);
      });
  };

  tryOpenUrl(aircallUrls, 0);
};

// Custom phone info row with call button
const PhoneInfoRow = ({ label, value }) => {
  if (!value) return null;

  return (
    <View className="py-3 flex-row justify-between items-center">
      <Text className="text-gray-500">{label}</Text>
      <View className="flex-row items-center">
        <Text className="text-gray-700">{value}</Text>
        <TouchableOpacity
          onPress={() => handleAircallOpen(value)}
          className="ml-3 p-2 bg-green-50 rounded-full"
        >
          <PhoneIcon size={16} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const btnBtn = ['Overview', 'Activities', 'Notes']

export default function DetailLeadScreen() {
  const navigation = useNavigation();
  const [btnIndex, setBtnIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const route = useRoute()
  const { lead: routeLead, leadId } = route.params || {}

  console.log("Route params:", route.params);
  console.log("Lead from route:", routeLead);
  console.log("Lead ID from route:", leadId);

  // Use leadId from params if available, otherwise use the id from routeLead
  const id = leadId || routeLead?._id

  console.log("Using lead ID:", id);

  const { lead, isLoading, error, refetch } = useGetLeadDetail(id);

  console.log("Lead data from API:", lead);

  const { deleteLead, isLoading: isDeleteLoading } = useDeleteLead();

  // Handle case when no lead data is available
  useEffect(() => {
    if (error) {
      console.error("Lead detail error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error loading lead',
        text2: error.message || 'Please try again',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50
      });
    }
  }, [error]);

  // Get customer data from either API response or route params
  const customerData = lead?.lead || routeLead;

  console.log("Final customer data:", customerData);

  const deleteCustomer = async () => {
    try {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this lead?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setIsDeleting(true);
              try {
                // Use deleteLead function from hook
                await deleteLead(id);

                setIsDeleting(false);

                // Use Toast instead of Alert
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Lead deleted successfully',
                  visibilityTime: 2000,
                  autoHide: true,
                  topOffset: 50,
                  onHide: () => NavigationService.navigate('lead')
                });

                // Navigate immediately, don't wait for Toast to hide
                NavigationService.navigate('lead');

              } catch (error) {
                setIsDeleting(false);
                console.error('Error deleting lead:', error);

                // Handle JSON parse error
                if (error instanceof SyntaxError && error.message.includes('JSON Parse')) {
                  Toast.show({
                    type: 'info',
                    text1: 'Information',
                    text2: 'The lead may have been deleted successfully. Please check the list.',
                    visibilityTime: 3000,
                    autoHide: true,
                    topOffset: 50,
                    onHide: () => NavigationService.navigate('lead')
                  });

                  // Navigate immediately in case of this specific error
                  NavigationService.navigate('lead');
                } else {
                  // For other errors
                  const errorMessage = error?.message || 'An error occurred while deleting the lead';
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: errorMessage,
                    visibilityTime: 3000,
                    autoHide: true,
                    topOffset: 50
                  });
                }
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in delete process:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while deleting the lead',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // If no data is available after loading
  if (!customerData) {
    return (
      <View className="flex-1 bg-white p-4 justify-center items-center">
        <Text className="text-xl text-gray-500 mb-4">Lead not found</Text>
        <TouchableOpacity
          onPress={() => NavigationService.navigate('lead')}
          className="p-3 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-medium">Return to Leads</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header with Edit and Delete buttons */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">{customerData?.name || 'Lead Details'}</Text>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => NavigationService.navigate('form_lead', { lead: customerData, edit: true })}
            className="p-2 bg-green-500 rounded-full"
          >
            <PencilIcon size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteCustomer}
            disabled={isDeleting || isDeleteLoading}
            className={`p-2 bg-red-500 rounded-full ml-6 ${(isDeleting || isDeleteLoading) ? 'opacity-50' : ''}`}
          >
            {(isDeleting || isDeleteLoading) ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <TrashIcon size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <ScrollView className="flex-1">
          {/* Customer Information */}
          <View className="px-4 border border-neutral-200 rounded-2xl divide-y divide-neutral-200 mb-5">
            <InfoRow label="Name" value={customerData?.name} />
            <PhoneInfoRow label="Phone" value={customerData?.phone} />
            <InfoRow label="Email" value={customerData?.email} />
            <InfoRow label="Assigned to" value={lead?.assignedToUsername} />
            <InfoRow label="Status" value={customerData?.status} badge />
            <InfoRow label="Address" value={customerData?.address} col />
          </View>

          {/* Conditionally render content based on tab */}
          {btnIndex === 0 && (
            <OverView
              createdAt={customerData?.createdAt}
              source={customerData?.source}
            />
          )}
          {btnIndex === 1 && (
            <View style={{ height: 300 }}>
              <Activities email={customerData?.email} createdAt={customerData?.createdAt} state={customerData?.status} />
            </View>
          )}
          {btnIndex === 2 && (
            <Notes
              leadId={customerData?._id}
              notes={lead?.notes || []}
              refetch={refetch}
            />
          )}
        </ScrollView>
      </View>

      {/* Navigation Tabs */}
      <BottomNavigation navigatesBtn={btnBtn} setBtnIndex={setBtnIndex} btnIndex={btnIndex} />

      <Toast />
    </View>
  );
}