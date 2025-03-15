import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { convertDate } from '@/utils';

const DetailRow = ({ label, value }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    label: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
      textAlign: 'right',
      flex: 1,
      marginLeft: 8,
    }
  });
  
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );
};

const OverviewTab = ({ task }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    userSection: {
      marginTop: 16,
    }
  });
  
  return (
    <View>
      {/* Task Details */}
      <View style={styles.container}>
        <Text style={styles.title}>Task Details</Text>
        <DetailRow label="Type" value={task.type} />
        <DetailRow label="Status" value={task.status} />
        <DetailRow label="Created" value={convertDate(task.createdAt)} />
        <DetailRow label="Payment Status" value={task.paymentStatus || 'PENDING'} />
        <DetailRow 
          label="Price" 
          value={
            task.price?.amount 
              ? `${(task.price.amount / 100).toFixed(2)} ${task.price.currency || 'USD'}`
              : 'N/A'
          } 
        />
      </View>
      
      {/* Reservation Details */}
      <View style={styles.container}>
        <Text style={styles.title}>Reservation Details</Text>
        <DetailRow 
          label="Guest Name" 
          value={task.reservationDetails?.guestName || 'N/A'} 
        />
        <DetailRow 
          label="Guest Count" 
          value={task.reservationDetails?.guestCount?.toString() || '0'} 
        />
        <DetailRow 
          label="Check In" 
          value={convertDate(task.reservationDetails?.checkIn)} 
        />
        <DetailRow 
          label="Check Out" 
          value={convertDate(task.reservationDetails?.checkOut)} 
        />
        <DetailRow 
          label="Reservation ID" 
          value={task.reservationId} 
        />
      </View>
      
      {/* Assigned User */}
      <View style={[styles.container, styles.userSection]}>
        <Text style={styles.title}>Assigned User</Text>
        <DetailRow label="Name" value={task.userDetails?.name} />
        <DetailRow label="Email" value={task.userDetails?.email} />
        <DetailRow label="Phone" value={task.userDetails?.phone} />
        <DetailRow label="Role" value={task.userDetails?.role} />
      </View>
    </View>
  );
};

export default OverviewTab;