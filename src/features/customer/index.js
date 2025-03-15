import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import CustomerCard from "@/components/CustomerCard";
import Loading from "@/components/ui/Loading";
import { useGetCustomers } from '@/hooks/useCustomer';
import { useTheme } from "@/shared/theme";
import { ThemedText } from "@/components";

const CustomerComponent = () => {
  const { customers, isLoading, fetching, pagination, loadMore } = useGetCustomers();
  const { theme } = useTheme();
  console.log('customers', customers?.leads)
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
    }
  });



  if (isLoading) {
    return <Loading />;
  }

  // Render each customer card manually
  const renderCustomers = () => {
    if (!customers || customers.length === 0) {
      return (
        <View style={dynamicStyles.emptyContainer}>
          <ThemedText>No customers found</ThemedText>
        </View>
      );
    }

    // Check if customers exists before mapping
    return Array.isArray(customers?.leads) ? customers?.leads?.map((item) => (
      <View key={item._id} style={dynamicStyles.cardContainer}>
        <CustomerCard item={item} />
      </View>
    )) : null;
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
      >
        {renderCustomers()}

        {fetching && (
          <View style={dynamicStyles.footerLoader}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CustomerComponent;