import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@/shared/theme'
import InfoRow from '@/components/InfoRow'

const OverView = ({ source, createdAt }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    noteContainer: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    noteText: {
      color: theme.text,
      lineHeight: 22,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      color: theme.text,
      backgroundColor: theme.background,
      marginBottom: 8,
      textAlignVertical: 'top',
      minHeight: 100,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
    },
    iconButton: {
      padding: 8,
      borderRadius: 8,
      marginLeft: 8,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.primary + '20',
    },
    addButtonText: {
      color: theme.primary,
      marginLeft: 4,
      fontWeight: '500',
    }
  });

  // Simplified overview now that notes functionality has been moved to the Notes tab

  return (
    <View>
      {/* Additional Information */}
      <View className="border border-neutral-200 rounded-2xl px-4 divide-y divide-neutral-200 mb-5">
        <InfoRow label="Source" value={source} />
        <InfoRow label="Created Date" value={createdAt} />
      </View>
    </View>
  );
};

export default OverView;