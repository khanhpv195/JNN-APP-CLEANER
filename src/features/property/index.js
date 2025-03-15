import React from 'react';
import { View, FlatList, StyleSheet, Text, Platform } from 'react-native';
import PropertyCard from '@/components/PropertyCard';
import { useGetProperty } from '@/hooks/useProperty';
import Loading from '@/components/ui/Loading';

export default function PropertyComponent() {
  const { properties, isLoading, setFetching } = useGetProperty();



  if (isLoading) {
    return <Loading />;
  }

  if (!properties || properties.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No properties found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item, index) => item.id || `property-${index}`}
        renderItem={({ item }) => <PropertyCard {...item} />}
        contentContainerStyle={styles.contentContainer}
        onEndReached={() => {
          console.log('End reached');
          setFetching && setFetching(true);
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={8}

        ListFooterComponent={() => (
          <Text style={styles.footerText}>End of list</Text>
        )}
        scrollEventThrottle={16}
        directionalLockEnabled={true}
        disableScrollViewPanResponder={false}
        legacyImplementation={Platform.OS === 'android'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 120,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 100,
    textAlign: 'center',
    color: '#666',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  }
});
