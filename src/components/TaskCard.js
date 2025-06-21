import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const TaskStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'IN_PROGRESS':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'COMPLETED':
        return { bg: '#D1FAE5', text: '#059669' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const colors = getStatusColor();

  return (
    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

const TaskCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(item)}>
      {/* Header - Chỉ hiển thị trạng thái */}
      <View style={styles.header}>
        <TaskStatusBadge status={item.status} />
      </View>

      {/* Title - Hiển thị nổi bật */}
      <Text style={styles.title} numberOfLines={1}>
        {item.title || 'Untitled Task'}
      </Text>

      {/* Description - Hiển thị nhỏ hơn */}
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      {/* Lead Info */}
      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={16} color="#6B7280" />
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Lead: </Text>
          {typeof item.leadId === 'object' && item.leadId?.name
            ? `${item.leadId.name}${item.leadId.phone ? ` • ${item.leadId.phone}` : ''}`
            : item.leadId || 'N/A'}
        </Text>
      </View>

      {/* Assigned To - Hiển thị assignedId.fullName thay vì userId.fullName */}
      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={16} color="#6B7280" />
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Assigned to: </Text>
          {typeof item.assignedId === 'object' && item.assignedId?.fullName
          }
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            {format(new Date(item.date), 'MMM dd, yyyy')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            {format(new Date(item.date), 'HH:mm')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Đặt badge ở bên phải
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
  },
  infoLabel: {
    fontWeight: '500',
    color: '#4B5563',
  },
});

export default TaskCard;