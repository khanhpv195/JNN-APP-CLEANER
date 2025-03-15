import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from '@/shared/theme';
import { ExclamationTriangleIcon } from 'react-native-heroicons/outline';

const IssueItem = ({ issue }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.cardLight || '#f8fafc',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 8,
    },
    description: {
      fontSize: 14,
      color: theme.text,
      marginBottom: 12,
      lineHeight: 20,
    },
    photosTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
      marginVertical: 8,
    },
    photosContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    photo: {
      width: 100,
      height: 100,
      borderRadius: 8,
      marginRight: 8,
      marginBottom: 8,
    },
    warningIcon: {
      color: theme.warning,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ExclamationTriangleIcon size={20} color={theme.warning} />
        <Text style={styles.title}>{issue.title || 'Issue'}</Text>
      </View>
      
      <Text style={styles.description}>
        {issue.description || 'No description provided'}
      </Text>
      
      {issue.photos && issue.photos.length > 0 && (
        <>
          <Text style={styles.photosTitle}>Photos ({issue.photos.length})</Text>
          <View style={styles.photosContainer}>
            {issue.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo.url }}
                style={styles.photo}
                resizeMode="cover"
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const IssuesTab = ({ task }) => {
  const { theme } = useTheme();
  const issues = task?.completionDetails?.issues || [];
  
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
    emptyState: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      marginVertical: 16,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Issues</Text>
      
      {issues.length > 0 ? (
        issues.map((issue, index) => (
          <IssueItem key={index} issue={issue} />
        ))
      ) : (
        <View style={styles.emptyState}>
          <ExclamationTriangleIcon 
            size={48} 
            color={theme.textSecondary} 
            style={styles.emptyIcon} 
          />
          <Text style={styles.emptyText}>
            No issues have been reported for this task
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default IssuesTab;