import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from 'react-native-heroicons/outline';
import NavigationService from '@/navigation/NavigationService';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/components';

const CustomerCard = ({ item }) => {
  const { name, phone, email, address, status } = item;
  const { theme } = useTheme();
  
  // Create dynamic styles based on the theme
  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.primary + '20', // Add 20% opacity to primary color
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    infoContainer: {
      padding: 12,
      gap: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    infoText: {
      marginLeft: 8,
      color: theme.textSecondary || theme.text,
      fontSize: 14,
    },
  });

  const handlePress = () => {
    NavigationService.navigate('customer_detail', { lead: item });
  };

  // Determine badge color based on status and theme
  const getBadgeColor = () => {
    if (status === 'NEW') {
      return theme.success || '#4CAF50';
    }
    return theme.accent || '#2196F3';
  };

  return (
    <TouchableOpacity
      style={dynamicStyles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={dynamicStyles.header}>
        <ThemedText style={dynamicStyles.name}>{name}</ThemedText>
        {status && (
          <View style={[dynamicStyles.badge, { backgroundColor: getBadgeColor() }]}>
            <ThemedText style={dynamicStyles.badgeText}>{status}</ThemedText>
          </View>
        )}
      </View>

      <View style={dynamicStyles.infoContainer}>
        <View style={dynamicStyles.infoRow}>
          <PhoneIcon size={16} color={theme.textSecondary} />
          <ThemedText style={dynamicStyles.infoText}>{phone}</ThemedText>
        </View>

        <View style={dynamicStyles.infoRow}>
          <EnvelopeIcon size={16} color={theme.textSecondary} />
          <ThemedText style={dynamicStyles.infoText}>{email}</ThemedText>
        </View>

        <View style={dynamicStyles.infoRow}>
          <MapPinIcon size={16} color={theme.textSecondary} />
          <ThemedText style={dynamicStyles.infoText}>{address || 'No address'}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Static styles removed as we now use dynamic theme-based styles

export default CustomerCard;