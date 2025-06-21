import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPinIcon, KeyIcon, UserCircleIcon, CurrencyDollarIcon, HomeIcon, CheckCircleIcon, UserIcon } from "react-native-heroicons/outline";
import { useNavigation } from '@react-navigation/native';

const PropertyCard = ({ name, assignedTo, address, price_cleaning, price_maintenance, leadName, property_type, listed, hospitableId, _id }) => {
  const navigation = useNavigation();

  // Capitalize first letter of property type
  const formatPropertyType = (type) => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
  };

  return (
    <TouchableOpacity onPress={() => {
      navigation.navigate('property_detail', { id: _id })
    }}>
      <View style={{/* was: className="bg-gray-50 rounded-xl p-4 mb-4 shadow-sm" */}}>
        <View style={{/* was: className="flex-row justify-between items-center mb-2" */}}>
          <Text style={{/* was: className="text-black text-lg font-semibold" */}}>{name}</Text>
          <View style={{/* was: className="flex-row items-center" */}}>
            <HomeIcon size={16} color="#6B7280" />
            <Text style={{/* was: className="text-gray-600 ml-1" */}}>{formatPropertyType(property_type)}</Text>
          </View>
        </View>

        {leadName && (
          <View style={{/* was: className="mb-3 bg-yellow-50 p-2 rounded-lg flex-row items-center" */}}>
            <UserIcon size={18} color="#D97706" />
            <Text style={{/* was: className="text-yellow-700 font-medium ml-2" */}}>Lead: {leadName}</Text>
          </View>
        )}

        <View style={{/* was: className="flex-row items-center mb-3" */}}>
          <MapPinIcon size={18} color="#6B7280" />
          <Text style={{/* was: className="text-gray-700 ml-2" */}}>{address || 'Europejska 94, Warszawa 02-964'}</Text>
        </View>

        <View style={{/* was: className="flex-row justify-between mb-4" */}}>
          <View style={{/* was: className="flex-1 mr-2 bg-blue-50 p-3 rounded-lg" */}}>
            <Text style={{/* was: className="text-gray-700 font-medium mb-1" */}}>Cleaner</Text>
            {assignedTo?.cleaner ? (
              <>
                <View style={{/* was: className="flex-row items-center" */}}>
                  <UserCircleIcon size={16} color="#4B5563" />
                  <Text style={{/* was: className="text-gray-700 ml-2 text-sm" */}}>{assignedTo.cleaner.fullName}</Text>
                </View>
                <View style={{/* was: className="flex-row items-center mt-1" */}}>
                  <KeyIcon size={16} color="#4B5563" />
                  <Text style={{/* was: className="text-gray-700 ml-2 text-sm" */}}>{assignedTo.cleaner.email}</Text>
                </View>
              </>
            ) : (
              <Text style={{/* was: className="text-gray-500 italic text-sm" */}}>Not assigned</Text>
            )}
          </View>

          <View style={{/* was: className="flex-1 bg-green-50 p-3 rounded-lg" */}}>
            <Text style={{/* was: className="text-gray-700 font-medium mb-1" */}}>Maintenance</Text>
            {assignedTo?.maintenance ? (
              <>
                <View style={{/* was: className="flex-row items-center" */}}>
                  <UserCircleIcon size={16} color="#4B5563" />
                  <Text style={{/* was: className="text-gray-700 ml-2 text-sm" */}}>{assignedTo.maintenance.fullName}</Text>
                </View>
                <View style={{/* was: className="flex-row items-center mt-1" */}}>
                  <KeyIcon size={16} color="#4B5563" />
                  <Text style={{/* was: className="text-gray-700 ml-2 text-sm" */}}>{assignedTo.maintenance.email}</Text>
                </View>
              </>
            ) : (
              <Text style={{/* was: className="text-gray-500 italic text-sm" */}}>Not assigned</Text>
            )}
          </View>
        </View>

        <View style={{/* was: className="flex-row justify-between items-center pt-3 border-t border-gray-200" */}}>
          <View style={{/* was: className="flex-row items-center" */}}>
            <CurrencyDollarIcon size={18} color="#10B981" />
            <Text style={{/* was: className="text-gray-800 font-bold ml-1" */}}>
              Cleaning: ${price_cleaning ? (price_cleaning / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </Text>
          </View>

          <View style={{/* was: className="flex-row items-center" */}}>
            <CurrencyDollarIcon size={18} color="#10B981" />
            <Text style={{/* was: className="text-gray-800 font-bold ml-1" */}}>
              Maint: ${price_maintenance ? (price_maintenance / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </Text>
          </View>
        </View>

        <View style={{/* was: className="flex-row justify-end items-center mt-2" */}}>
          <View style={{/* was: className="flex-row items-center" */}}>
            <CheckCircleIcon size={16} color={listed ? "#10B981" : "#9CA3AF"} />
            <Text className={`ml-1 text-sm ${listed ? "text-green-600" : "text-gray-500"}`}>
              {listed ? "Listed" : "Not Listed"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default PropertyCard