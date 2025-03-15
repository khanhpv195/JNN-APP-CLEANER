import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { MapPinIcon, CalendarDaysIcon, ArrowLeftIcon } from 'react-native-heroicons/outline';
import { convertDate, formatCurrency } from '@/utils';

// Components
import BottomNavigation from '@/components/ui/BottomNavigation';
import Loading from '@/components/ui/Loading';
import OverviewTab from './components/OverviewTab';
import PaymentTab from './components/PaymentTab';
import IssuesTab from './components/IssuesTab';
import PhotosTab from './components/PhotosTab';

// Hooks
import { useTaskDetail } from '@/shared/api/taskApis';
import { useCreatePayment } from '@/shared/api/paymentApis';

// Tab names for bottom navigation
const TAB_NAMES = ['Overview', 'Payment', 'Issues', 'Photos'];

const TaskDetailComponent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params || {};
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  
  // Fetch task details
  const { 
    data: taskData, 
    isLoading, 
    error, 
    refetch 
  } = useTaskDetail(taskId);
  
  // Payment mutation
  const { mutateAsync: createPayment, isLoading: isProcessingPayment } = useCreatePayment();

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Process payment (accept or reject)
  const handlePayment = async (status) => {
    const actionText = status === 'ACCEPTED' ? 'accept' : 'reject';
    
    Alert.alert(
      `Confirm Payment ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      `Are you sure you want to ${actionText} this payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: status === 'ACCEPTED' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await createPayment({
                taskId: taskId,
                paymentStatus: status
              });
              
              Alert.alert(
                'Success',
                `Payment ${status === 'ACCEPTED' ? 'accepted' : 'rejected'} successfully`
              );
              
              // Refresh task data to update UI
              refetch();
            } catch (error) {
              console.error('Payment error:', error);
              Alert.alert(
                'Error',
                `Failed to ${actionText} payment. ${error.message || 'Please try again later.'}`
              );
            }
          }
        }
      ]
    );
  };

  // Format payment status for display
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return theme.success || '#22c55e';
      case 'PENDING':
        return theme.warning || '#f59e0b';
      case 'REJECTED':
        return theme.error || '#ef4444';
      default:
        return theme.text;
    }
  };

  // Create styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    propertyHeader: {
      backgroundColor: theme.backgroundMuted,
      padding: 16,
    },
    propertyName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    propertyType: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text,
    },
    icon: {
      marginRight: 8,
      marginTop: 2,
    },
    address: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
    },
    addressText: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      marginLeft: 8,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: 'white',
    },
    paymentText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    price: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      marginBottom: 24,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 8,
    },
    acceptButton: {
      backgroundColor: theme.success || '#22c55e',
    },
    rejectButton: {
      backgroundColor: theme.error || '#ef4444',
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
    },
    tabContent: {
      flex: 1,
    },
  });

  // Handle loading state
  if (isLoading) {
    return <Loading />;
  }

  // Handle error state
  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Error loading task details</Text>
        <TouchableOpacity 
          style={{ marginTop: 16, padding: 12, backgroundColor: theme.primary, borderRadius: 8 }}
          onPress={refetch}
        >
          <Text style={{ color: 'white' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get task from response
  const task = taskData?.data;
  if (!task) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>No task data found</Text>
      </View>
    );
  }

  // Check if payment buttons should be shown
  const showPaymentButtons = 
    task.status === 'COMPLETED' && 
    (task.paymentStatus === 'PENDING' || !task.paymentStatus);
  
  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Task Detail</Text>
      </View>
      
      <ScrollView 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* Property Card */}
        <View style={styles.card}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyName}>{task.propertyDetails?.name || 'Property'}</Text>
            <Text style={styles.propertyType}>{task.type || 'TASK'}</Text>
          </View>
          
          {/* Dates */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <CalendarDaysIcon size={20} color={theme.textSecondary} style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Check In</Text>
                <Text style={styles.infoValue}>
                  {convertDate(task.reservationDetails?.checkIn)}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <CalendarDaysIcon size={20} color={theme.textSecondary} style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Check Out</Text>
                <Text style={styles.infoValue}>
                  {convertDate(task.reservationDetails?.checkOut)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Address */}
          <View style={styles.address}>
            <MapPinIcon size={20} color={theme.textSecondary} />
            <Text style={styles.addressText}>{task.propertyDetails?.address}</Text>
          </View>
          
          {/* Status and Price */}
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.paymentText}>Payment</Text>
              <Text style={styles.price}>
                {formatCurrency(task.price?.amount, task.price?.currency || 'USD')}
              </Text>
            </View>
            
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getPaymentStatusColor(task.paymentStatus) }
            ]}>
              <Text style={styles.statusText}>{task.paymentStatus || 'PENDING'}</Text>
            </View>
          </View>
        </View>
        
        {/* Payment Action Buttons */}
        {showPaymentButtons && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => handlePayment('REJECTED')}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Reject Payment</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => handlePayment('ACCEPTED')}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Accept Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 0 && <OverviewTab task={task} />}
          {activeTab === 1 && <PaymentTab task={task} />}
          {activeTab === 2 && <IssuesTab task={task} />}
          {activeTab === 3 && <PhotosTab task={task} />}
        </View>
      </ScrollView>
      
      {/* Bottom Navigation Tabs */}
      <BottomNavigation 
        navigatesBtn={TAB_NAMES} 
        setBtnIndex={setActiveTab} 
        btnIndex={activeTab} 
      />
    </View>
  );
};

export default TaskDetailComponent;