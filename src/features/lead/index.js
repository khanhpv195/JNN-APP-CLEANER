import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Modal, Alert, RefreshControl } from "react-native";
import { useTheme } from "@/shared/theme";
import { ThemedText, ThemedButton, ThemedCard } from "@/components";
import { UserIcon, PencilIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useGetLeads, useUpdateLead } from '@/hooks/useLead';
import NavigationService from '@/navigation/NavigationService';

// Lead status options
const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

const LeadCard = ({ item, onStatusChange }) => {
  const { theme } = useTheme();
  const [showStatusModal, setShowStatusModal] = useState(false);

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
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
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
    editIcon: {
      marginLeft: 8,
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
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 20,
      width: '80%',
      maxHeight: '60%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    closeButton: {
      padding: 5,
    },
    statusOption: {
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    selectedStatus: {
      backgroundColor: theme.primary + '20',
    }
  });

  const handlePress = () => {
    NavigationService.navigate('lead_detail', { lead: item });
  };

  // Determine badge color based on status and theme
  const getBadgeColor = () => {
    const { status } = item;

    switch (status) {
      case 'NEW':
        return theme.primary || '#22c55e';
      case 'CONTACTED':
        return theme.accent || '#2E90FA';
      case 'QUALIFIED':
        return theme.success || '#34C759';
      case 'CONVERTED':
        return '#8b5cf6'; // Purple
      case 'LOST':
        return theme.error || '#FF3B30';
      default:
        return theme.secondary || '#6C737F';
    }
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus !== item.status) {
      onStatusChange(item._id, newStatus);
    }
    setShowStatusModal(false);
  };

  return (
    <TouchableOpacity
      style={dynamicStyles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={dynamicStyles.header}>
        <ThemedText style={dynamicStyles.name}>{item.name}</ThemedText>
        <View style={dynamicStyles.statusContainer}>
          {item.status && (
            <TouchableOpacity
              onPress={() => setShowStatusModal(true)}
              style={[dynamicStyles.badge, { backgroundColor: getBadgeColor() }]}
            >
              <ThemedText style={dynamicStyles.badgeText}>{item.status}</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={dynamicStyles.editIcon}
            onPress={() => setShowStatusModal(true)}
          >
            <PencilIcon size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={dynamicStyles.infoContainer}>
        <View style={dynamicStyles.infoRow}>
          <UserIcon size={16} color={theme.textSecondary} />
          <ThemedText style={dynamicStyles.infoText}>
            {item.phone || 'No phone'}
          </ThemedText>
        </View>

        <View style={dynamicStyles.infoRow}>
          <UserIcon size={16} color={theme.textSecondary} />
          <ThemedText style={dynamicStyles.infoText}>
            {item.email || 'No email'}
          </ThemedText>
        </View>

        <View style={dynamicStyles.infoRow}>
          <UserIcon size={16} color={theme.textSecondary} />
          <ThemedText style={dynamicStyles.infoText}>
            {item.address || 'No address'}
          </ThemedText>
        </View>
      </View>

      {/* Status Change Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={dynamicStyles.modalContainer}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <ThemedText style={dynamicStyles.modalTitle}>Update Lead Status</ThemedText>
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setShowStatusModal(false)}
              >
                <XMarkIcon size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {LEAD_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    dynamicStyles.statusOption,
                    item.status === status && dynamicStyles.selectedStatus
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <ThemedText>
                    {status} {item.status === status && '✓'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const LeadComponent = () => {
  const { leads: leadsData, isLoading, fetching, refresh } = useGetLeads();
  const [leads, setLeads] = useState([]);
  const { theme } = useTheme();
  const { updateLead, isLoading: isUpdateLoading } = useUpdateLead();

  useEffect(() => {
    if (Array.isArray(leadsData)) {
      setLeads(leadsData);
    } else if (leadsData && typeof leadsData === 'object') {
      if (leadsData.data && Array.isArray(leadsData.data)) {
        setLeads(leadsData.data);
      } else if (leadsData.leads && Array.isArray(leadsData.leads)) {
        setLeads(leadsData.leads);
      } else {
        console.error("Leads data is not in expected format:", leadsData);
        setLeads([]);
      }
    } else {
      console.error("Invalid leads data:", leadsData);
      setLeads([]);
    }
  }, [leadsData]);

  // Create dynamic styles based on the theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
      height: '100%',
    },
    scrollContent: {
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    cardContainer: {
      marginBottom: 10,
    },
    emptyContainer: {
      padding: 20,
      alignItems: 'center',
    },
    footerLoader: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    addButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    }
  });

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateLead({
        id: leadId,
        status: newStatus
      });

      refresh();

      Alert.alert("Success", "Lead status updated");
    } catch (error) {
      console.error("Error updating lead status:", error);
      Alert.alert("Error", "Failed to update lead status");

      refresh();
    }
  };

  // Debug logs
  useEffect(() => {
    console.log("Leads count:", leads?.length);
  }, [leads]);

  if (isLoading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Render each lead card
  const renderLeads = () => {
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return (
        <View style={dynamicStyles.emptyContainer}>
          <ThemedText>No leads found</ThemedText>
        </View>
      );
    }

    return leads.map((item) => (
      <View key={item._id} style={dynamicStyles.cardContainer}>
        <LeadCard
          item={item}
          onStatusChange={handleStatusChange}
        />
      </View>
    ));
  };

  return (
    <View style={dynamicStyles.container}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={fetching}
            onRefresh={refresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {renderLeads()}

        {fetching && (
          <View style={dynamicStyles.footerLoader}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={dynamicStyles.addButton}
        onPress={() => NavigationService.navigate('form_lead')}
      >
        <ThemedText style={{ color: '#FFFFFF', fontSize: 30 }}>+</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

export default LeadComponent;