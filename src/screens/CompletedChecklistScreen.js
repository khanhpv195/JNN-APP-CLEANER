import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CompletedChecklistScreen({ route }) {
    const { checkListCompleted } = route.params;

    console.log('Checklist Data:', checkListCompleted); // Debug log

    // Kiểm tra nếu không có dữ liệu
    if (!checkListCompleted || checkListCompleted.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.noDataText}>No checklist data available</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Check-in Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Check-in</Text>
                {checkListCompleted.filter(item => item.title === 'Check-in')[0]?.items.map((item, index) => (
                    <View key={index} style={styles.item}>
                        <View style={styles.itemHeader}>
                            <Ionicons
                                name={item.checked ? "checkmark-circle" : "circle-outline"}
                                size={24}
                                color={item.checked ? "#4CAF50" : "#666"}
                            />
                            <Text style={styles.itemText}>{item.text}</Text>
                        </View>
                        {item.imageUrl && (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* Check-out Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Check-out</Text>
                {checkListCompleted.filter(item => item.title === 'Check-out')[0]?.items.map((item, index) => (
                    <View key={index} style={styles.item}>
                        <View style={styles.itemHeader}>
                            <Ionicons
                                name={item.checked ? "checkmark-circle" : "circle-outline"}
                                size={24}
                                color={item.checked ? "#4CAF50" : "#666"}
                            />
                            <Text style={styles.itemText}>{item.text}</Text>
                        </View>
                        {item.imageUrl && (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.image}
                                    resizeMode="cover"
                                    onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                                />
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
        color: '#666',
    },
    section: {
        backgroundColor: 'white',
        marginBottom: 16,
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    item: {
        marginBottom: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    imageContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#f5f5f5',
    },
}); 