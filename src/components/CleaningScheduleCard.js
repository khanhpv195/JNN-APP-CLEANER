import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MapPinIcon, CalendarDaysIcon, ClockIcon, SparklesIcon } from 'react-native-heroicons/outline';
import NavigationService from '@/navigation/NavigationService';
import { convertDate } from '@/utils';

// Helper function to determine status color
const getStatusColor = (status) => {
  if (!status) return '#F59E0B'; // Default yellow for unknown status
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('completed')) return '#10B981'; // Green
  if (statusLower.includes('progress')) return '#2E90FA'; // Blue
  if (statusLower.includes('pending')) return '#6366F1'; // Indigo
  if (statusLower.includes('cancel')) return '#EF4444'; // Red
  return '#F59E0B'; // Yellow for other statuses
};

// Timeline badge for cleaning urgency
const UrgencyBadge = ({ checkIn, checkOut }) => {
  try {
    // Default to medium urgency
    let bgColor = '#F59E0B'; // Yellow
    let textColor = '#FFF';
    let label = 'MEDIUM';
    
    // If we have both dates, calculate urgency based on turnaround time
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      // Calculate hours between checkout and checkin
      const hoursDiff = (checkInDate - checkOutDate) / (1000 * 60 * 60);
      
      if (hoursDiff < 4) {
        bgColor = '#EF4444'; // Red
        label = 'URGENT';
      } else if (hoursDiff < 8) {
        bgColor = '#F59E0B'; // Yellow
        label = 'MEDIUM';
      } else {
        bgColor = '#10B981'; // Green
        label = 'STANDARD';
      }
    }
    
    return (
      <View style={{ backgroundColor: bgColor, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
        <Text style={{ color: textColor, fontSize: 12, fontWeight: 'bold' }}>{label}</Text>
      </View>
    );
  } catch (error) {
    // Return default medium if error calculating
    return (
      <View style={{ backgroundColor: '#F59E0B', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }}>
        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>MEDIUM</Text>
      </View>
    );
  }
};

const CleaningScheduleCard = ({ item }) => {
  if (!item) return null;
  
  const taskId = item?._id || item?.id || item?.taskId;
  const statusColor = getStatusColor(item?.status);
  const propertyName = item?.propertyDetails?.name || 'Property';
  const checkIn = item?.reservationDetails?.checkIn;
  const checkOut = item?.reservationDetails?.checkOut;
  const isSameDay = item?.sameDayArrival || true;
  const cleaners = item?.assignedCleaners || [];
  const primaryCleaner = cleaners.length > 0 ? cleaners[0]?.name : (item?.userDetails?.name || 'Unassigned');

  return (
    <TouchableOpacity
      style={{/* was: className="my-3" */}}
      onPress={() => {
        NavigationService.navigate('task', {
          screen: 'TaskDetail',
          params: { id: taskId, type: 'CLEANING' }
        });
      }}
    >
      <View style={{/* was: className="bg-white rounded-xl shadow-md border border-gray-100" */}}>
        {/* Colored top border to indicate it's a cleaning task */}
        <View style={{ height: 6, backgroundColor: '#60A5FA', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
        
        <View style={{/* was: className="px-4 pt-3 pb-2" */}}>
          <View style={{/* was: className="flex-row justify-between items-center" */}}>
            <View style={{/* was: className="flex-row items-center" */}}>
              <SparklesIcon size={20} color="#60A5FA" />
              <Text style={{/* was: className="font-bold text-base ml-2 text-blue-500" */}}>CLEANING</Text>
              <UrgencyBadge checkIn={checkIn} checkOut={checkOut} />
            </View>
            <View style={{ backgroundColor: statusColor, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 }}>
              <Text style={{/* was: className="text-white text-xs font-bold" */}}>{item?.status || 'PENDING'}</Text>
            </View>
          </View>
          
          <Text style={{/* was: className="font-bold text-lg mt-2" */}}>{propertyName}</Text>
          
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
              <Text style={{/* was: className="text-gray-500 text-xs mb-1" */}}>CHECK OUT</Text>
              <View style={{/* was: className="flex-row items-center" */}}>
                <CalendarDaysIcon size={14} color="#6B7280" />
                <Text style={{/* was: className="font-semibold ml-1" */}}>
                  {convertDate(checkOut) || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={{/* was: className="flex-1 mr-2" */}}>
              <Text style={{/* was: className="text-gray-500 text-xs mb-1" */}}>CHECK IN</Text>
              <View style={{/* was: className="flex-row items-center" */}}>
                <CalendarDaysIcon size={14} color="#6B7280" />
                <Text style={{/* was: className="font-semibold ml-1" */}}>
                  {convertDate(checkIn) || 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={{/* was: className="flex-1" */}}>
              <Text style={{/* was: className="text-gray-500 text-xs mb-1" */}}>SAME DAY</Text>
              <Text style={{/* was: className="font-semibold" */}}>{isSameDay ? 'Yes' : 'No'}</Text>
            </View>
          </View>
          
          <View style={{/* was: className="mt-3 flex-row justify-between items-center" */}}>
            <View style={{/* was: className="flex-row items-center" */}}>
              <Image
                source={{ uri: item?.userDetails?.avatar || 'https://v0.dev/placeholder.svg' }}
                style={{/* was: className="w-8 h-8 rounded-full" */}}
              />
              <View style={{/* was: className="ml-2" */}}>
                <Text style={{/* was: className="text-gray-500 text-xs" */}}>ASSIGNED TO</Text>
                <Text style={{/* was: className="font-semibold" */}}>{primaryCleaner}</Text>
              </View>
            </View>
            
            <View>
              <Text style={{/* was: className="text-gray-500 text-xs mb-1 text-right" */}}>PAYMENT</Text>
              <Text style={{/* was: className="font-semibold" */}}>{item?.paymentStatus || 'PENDING'}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Renamed for consistency
export default CleaningScheduleCard;