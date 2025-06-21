import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MapPinIcon, CalendarDaysIcon, WrenchScrewdriverIcon, BoltIcon, ExclamationTriangleIcon } from 'react-native-heroicons/outline';
import NavigationService from '@/navigation/NavigationService';
import { convertDate } from '@/utils';

// Helper function to determine status color
const getStatusColor = (status) => {
  if (!status) return '#F59E0B'; // Default yellow for unknown status
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('completed')) return '#10B981'; // Green
  if (statusLower.includes('progress') || statusLower.includes('pending')) return '#2E90FA'; // Blue
  if (statusLower.includes('cancel')) return '#EF4444'; // Red
  return '#F59E0B'; // Yellow for other statuses
};

// Badge component for maintenance issue priority
const PriorityBadge = ({ priority }) => {
  if (!priority) return null;
  
  const priorityLower = typeof priority === 'string' ? priority.toLowerCase() : '';
  let bgColor = '#F59E0B'; // Default yellow
  let textColor = '#FFF';
  let label = priority;
  
  if (priorityLower.includes('high') || priorityLower.includes('urgent')) {
    bgColor = '#EF4444'; // Red
    label = 'HIGH';
  } else if (priorityLower.includes('medium')) {
    bgColor = '#F59E0B'; // Yellow
    textColor = '#FFF';
    label = 'MEDIUM';
  } else if (priorityLower.includes('low')) {
    bgColor = '#10B981'; // Green
    label = 'LOW';
  }
  
  return (
    <View style={{ backgroundColor: bgColor, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
      <Text style={{ color: textColor, fontSize: 12, fontWeight: 'bold' }}>{label}</Text>
    </View>
  );
};

const MaintenanceCard = ({ item }) => {
  const taskId = item?._id || item?.id || item?.taskId;
  const statusColor = getStatusColor(item?.status);
  const maintenanceType = item?.maintenanceType || 'General';
  const priority = item?.priority || 'Medium';
  
  return (
    <TouchableOpacity
      style={{/* was: className="my-3" */}}
      onPress={() => {
        NavigationService.navigate('task', {
          screen: 'TaskDetail',
          params: { id: taskId, type: 'MAINTENANCE' }
        });
      }}
    >
      <View style={{/* was: className="bg-white rounded-xl shadow-md border border-gray-100" */}}>
        {/* Colored top border to indicate it's a maintenance task */}
        <View style={{ height: 6, backgroundColor: '#F87171', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
        
        <View style={{/* was: className="px-4 pt-3 pb-2" */}}>
          <View style={{/* was: className="flex-row justify-between items-center" */}}>
            <View style={{/* was: className="flex-row items-center" */}}>
              <WrenchScrewdriverIcon size={20} color="#F87171" />
              <Text style={{/* was: className="font-bold text-base ml-2 text-red-500" */}}>MAINTENANCE</Text>
              <PriorityBadge priority={priority} />
            </View>
            <View style={{ backgroundColor: statusColor, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 }}>
              <Text style={{/* was: className="text-white text-xs font-bold" */}}>{item?.status || 'PENDING'}</Text>
            </View>
          </View>
          
          <Text style={{/* was: className="font-bold text-lg mt-2" */}}>{item?.propertyDetails?.name || 'Property Name'}</Text>
          
          <View style={{/* was: className="flex-row items-center mt-1" */}}>
            <MapPinIcon size={16} color="#6B7280" />
            <Text style={{/* was: className="text-gray-600 text-sm ml-1 flex-shrink" */}} numberOfLines={1}>
              {item?.propertyDetails?.address || 'Property Address'}
            </Text>
          </View>
        </View>
        
        <View style={{/* was: className="bg-gray-50 p-4 rounded-b-xl" */}}>
          <View style={{/* was: className="flex-row justify-between" */}}>
            <View style={{/* was: className="flex-1 mr-2" */}}>
              <Text style={{/* was: className="text-gray-500 text-xs mb-1" */}}>REPORTED DATE</Text>
              <Text style={{/* was: className="font-semibold" */}}>
                {convertDate(item?.date) || convertDate(item?.reservationDetails?.checkIn) || 'N/A'}
              </Text>
            </View>
            
            <View style={{/* was: className="flex-1 mr-2" */}}>
              <Text style={{/* was: className="text-gray-500 text-xs mb-1" */}}>ISSUE TYPE</Text>
              <Text style={{/* was: className="font-semibold" */}}>{maintenanceType}</Text>
            </View>
            
            <View style={{/* was: className="flex-1" */}}>
              <Text style={{/* was: className="text-gray-500 text-xs mb-1" */}}>PAYMENT</Text>
              <Text style={{/* was: className="font-semibold" */}}>{item?.paymentStatus || 'PENDING'}</Text>
            </View>
          </View>
          
          {item?.description && (
            <View style={{/* was: className="mt-3 bg-gray-100 p-2 rounded-lg" */}}>
              <Text style={{/* was: className="text-gray-500 text-xs mb-1" */}}>ISSUE DESCRIPTION</Text>
              <Text style={{/* was: className="text-sm" */}} numberOfLines={2}>{item.description}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MaintenanceCard;