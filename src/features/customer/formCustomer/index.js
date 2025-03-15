import { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native'
import { ChevronDownIcon } from "react-native-heroicons/outline"
import { useNavigation, useRoute } from "@react-navigation/native"
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';

import { useCreateLead, useUpdateLead } from '@/hooks/useLead';
import NavigationService from '@/navigation/NavigationService'
import Loading from '@/components/ui/Loading';

const sourceOptions = [
  { label: 'Website', value: 'website' },
  { label: 'Social Media', value: 'social_media' },
  { label: 'Referral', value: 'referral' },
  { label: 'Other', value: 'other' }
];

const formatCurrency = (value) => {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Hàm loại bỏ định dạng tiền tệ, chỉ giữ lại số
const unformatCurrency = (value) => {
  if (!value) return '';
  // Loại bỏ tất cả ký tự không phải số
  return value.replace(/[^\d]/g, '');
};

export default function FormCustomerComponent() {
  const navigation = useNavigation()
  const route = useRoute()
  const { edit, lead } = route.params || {}

  const { createLead, isLoading: isCreating } = useCreateLead();
  const { updateLead, isLoading: isUpdating } = useUpdateLead();

  const [showSourceOptions, setShowSourceOptions] = useState(false);
  const [formattedLeadValue, setFormattedLeadValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form setup
  const { control, handleSubmit, setValue, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      source: '',
      address: '',
      notes: '',
      lead_value: ''
    }
  });

  // Set form title based on edit mode
  useLayoutEffect(() => {
    const title = edit ? 'Edit Customer' : 'Create Customer'
    navigation.setOptions({
      title
    });
  }, [edit, navigation]);

  // Populate form with lead data when editing
  useEffect(() => {
    if (edit && lead) {
      setValue('name', lead.name || '');
      setValue('email', lead.email || '');
      setValue('phone', lead.phone || '');
      setValue('source', lead.source || '');
      setValue('address', lead.address || '');
      setValue('notes', lead.notes || '');
      setValue('lead_value', lead.lead_value || '');

      if (lead.lead_value) {
        setFormattedLeadValue(formatCurrency(lead.lead_value));
      }
    }
  }, [edit, lead, setValue]);

  // Watch lead_value changes
  const leadValue = watch('lead_value');

  // Update formatted lead value when lead_value changes
  useEffect(() => {
    if (leadValue) {
      setFormattedLeadValue(formatCurrency(leadValue));
    }
  }, [leadValue]);

  // Handle lead value input with formatting
  const handleLeadValueChange = (text, onChange) => {
    const numericValue = unformatCurrency(text);
    onChange(numericValue);
    setFormattedLeadValue(formatCurrency(numericValue));
  };

  // Handle source selection
  const handleSelectSource = (source) => {
    setValue('source', source.value);
    setShowSourceOptions(false);
  };

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting data:", data);

      if (edit) {
        if (!lead?.id && !lead?._id) {
          throw new Error('Customer ID is missing. Cannot update.');
        }

        await updateLead({
          id: lead?.id || lead?._id,
          ...data
        });

        Toast.show({
          type: 'success',
          text1: 'Customer updated successfully',
        });

        // Trở về màn hình chi tiết và truyền tham số để refresh dữ liệu
        navigation.navigate('customer_detail', {
          lead: {
            ...lead,
            ...data,
            id: lead?.id || lead?._id,
            _id: lead?.id || lead?._id
          },
          refresh: true
        });
      } else {
        const response = await createLead(data);
        Toast.show({
          type: 'success',
          text1: 'Customer created successfully',
        });

        // Sau khi tạo mới, quay lại màn hình danh sách và refresh
        navigation.navigate('customer_list', { refresh: true });
      }
    } catch (error) {
      console.error('Error submitting customer:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save customer',
        text2: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading indicator while fetching data
  if (isCreating || isUpdating) {
    return <Loading />;
  }

  const RequiredField = () => (
    <Text className="text-red-500 ml-0.5">*</Text>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 mt-5 p-4">
        {/* Name Field */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-gray-700 font-medium">Name</Text>
            <RequiredField />
          </View>
          <Controller
            control={control}
            rules={{
              required: 'Name is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg p-3 bg-white`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="name"
          />
          {errors.name && (
            <Text className="text-red-500 mt-1">{errors.name.message}</Text>
          )}
        </View>

        {/* Email Field */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-gray-700 font-medium">Email</Text>
            <RequiredField />
          </View>
          <Controller
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg p-3 bg-white`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
            name="email"
          />
          {errors.email && (
            <Text className="text-red-500 mt-1">{errors.email.message}</Text>
          )}
        </View>

        {/* Phone Field */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-gray-700 font-medium">Phone</Text>
            <RequiredField />
          </View>
          <Controller
            control={control}
            rules={{
              required: 'Phone is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-lg p-3 bg-white`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="phone-pad"
              />
            )}
            name="phone"
          />
          {errors.phone && (
            <Text className="text-red-500 mt-1">{errors.phone.message}</Text>
          )}
        </View>

        {/* Source Field */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Source</Text>
          <Controller
            control={control}
            render={({ field: { value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => setShowSourceOptions(!showSourceOptions)}
                  className="w-full border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                >
                  <Text className={value ? "text-gray-700" : "text-gray-400"}>
                    {value
                      ? sourceOptions.find(option => option.value === value)?.label
                      : "Select source"}
                  </Text>
                  <ChevronDownIcon size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {showSourceOptions && (
                  <View className="w-full border border-gray-200 rounded-lg mt-1 bg-white overflow-hidden">
                    {sourceOptions.map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleSelectSource(option)}
                        className={`p-3 ${index < sourceOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <Text className="text-gray-700">{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
            name="source"
          />
        </View>

        {/* Address Field */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Address</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full border border-gray-200 rounded-lg p-3 bg-white"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
                numberOfLines={2}
              />
            )}
            name="address"
          />
        </View>

        {/* Lead Value Field */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Lead value</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur } }) => (
              <TextInput
                className="w-full border border-gray-200 rounded-lg p-3 bg-white"
                keyboardType="numeric"
                value={formattedLeadValue}
                onChangeText={(text) => handleLeadValueChange(text, onChange)}
                onBlur={onBlur}
                placeholder="0"
              />
            )}
            name="lead_value"
          />
        </View>

      </ScrollView>

      {/* Bottom Buttons */}
      <View className="p-4 flex-row space-x-4 border-t border-gray-200 flex-initial">
        <TouchableOpacity
          onPress={() => NavigationService.goBack()}
          className="flex-1 py-3 px-6 rounded-lg border border-gray-200"
          disabled={isSubmitting}
        >
          <Text className="text-center text-gray-600 font-medium">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 px-6 rounded-lg bg-green-500 ${isSubmitting ? 'opacity-70' : ''}`}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-center text-white font-medium ml-2">
                {edit ? 'Updating...' : 'Creating...'}
              </Text>
            </View>
          ) : (
            <Text className="text-center text-white font-medium">
              {edit ? 'Update' : 'Create'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}