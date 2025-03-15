import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import { convertDate, formatCurrency } from '@/utils';
import { CreditCardIcon, DocumentTextIcon, WalletIcon } from 'react-native-heroicons/outline';

// Data fetching
import { usePaymentHistory } from '@/shared/api/paymentApis';

const PaymentHistoryItem = ({ payment }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.cardLight || '#f8fafc',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    date: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 6,
    },
    label: {
      fontSize: 14,
      color: theme.textSecondary,
      width: 100,
    },
    value: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
      flex: 1,
    },
    icon: {
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.success,
    },
    statusText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    amountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    amount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
  });

  // Get status color based on payment status
  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return theme.success || '#22c55e';
      case 'PENDING':
        return theme.warning || '#f59e0b';
      case 'REJECTED':
        return theme.error || '#ef4444';
      default:
        return theme.primary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.date}>{convertDate(payment.date)}</Text>
      </View>

      <View style={styles.row}>
        <DocumentTextIcon size={18} color={theme.textSecondary} style={styles.icon} />
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{payment._id}</Text>
      </View>

      <View style={styles.row}>
        <CreditCardIcon size={18} color={theme.textSecondary} style={styles.icon} />
        <Text style={styles.label}>Method:</Text>
        <Text style={styles.value}>{payment.paymentMethod || 'Bank Transfer'}</Text>
      </View>

      <View style={styles.row}>
        <WalletIcon size={18} color={theme.textSecondary} style={styles.icon} />
        <Text style={styles.label}>Status:</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
          <Text style={styles.statusText}>{payment.status}</Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.title}>Amount</Text>
        <Text style={styles.amount}>
          {formatCurrency(payment.amount, 'USD')}
        </Text>
      </View>
    </View>
  );
};

const PaymentTab = ({ task }) => {
  const { theme } = useTheme();
  const taskId = task?._id;
  
  // Fetch payment history
  const { 
    data: paymentHistoryData, 
    isLoading, 
    error, 
    refetch 
  } = usePaymentHistory(taskId);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    paymentDetailRow: {
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
    },
    statusValue: {
      fontSize: 14,
      fontWeight: '500',
    },
    amount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginVertical: 16,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
    },
    errorText: {
      color: theme.error,
      marginBottom: 12,
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    retryText: {
      color: 'white',
      fontWeight: '500',
    },
    historyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginTop: 24,
      marginBottom: 12,
    },
  });

  // Get status color based on payment status
  const getStatusColor = (status) => {
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

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading payment history</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get payment history
  const paymentHistory = paymentHistoryData?.data || [];

  return (
    <View style={styles.container}>
      {/* Current Payment Status */}
      <View style={styles.card}>
        <Text style={styles.title}>Payment Details</Text>
        
        <View style={styles.paymentDetailRow}>
          <Text style={styles.label}>Status</Text>
          <Text 
            style={[
              styles.statusValue, 
              { color: getStatusColor(task.paymentStatus) }
            ]}
          >
            {task.paymentStatus || 'PENDING'}
          </Text>
        </View>
        
        <View style={styles.paymentDetailRow}>
          <Text style={styles.label}>Payment ID</Text>
          <Text style={styles.value}>{task.payment_id || 'Not available'}</Text>
        </View>
        
        <View style={styles.paymentDetailRow}>
          <Text style={styles.label}>Currency</Text>
          <Text style={styles.value}>{task.price?.currency || 'USD'}</Text>
        </View>
        
        <Text style={styles.amount}>
          {formatCurrency(task.price?.amount, task.price?.currency || 'USD')}
        </Text>
      </View>

      {/* Payment History */}
      {paymentHistory.length > 0 ? (
        <>
          <Text style={styles.historyTitle}>Payment History</Text>
          {paymentHistory.map((payment, index) => (
            <PaymentHistoryItem key={payment._id || index} payment={payment} />
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No payment history available
          </Text>
        </View>
      )}
    </View>
  );
};

export default PaymentTab;