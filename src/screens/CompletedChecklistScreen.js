import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CompletedChecklistScreen({ route }) {
    const { checkListCompleted } = route.params;

    console.log('Checklist Data:', JSON.stringify(checkListCompleted, null, 2)); // More detailed debug log

    // Kiểm tra nếu không có dữ liệu
    if (!checkListCompleted || checkListCompleted.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.noDataText}>No checklist data available</Text>
            </View>
        );
    }

    const ImageWithLoading = ({ uri }) => {
        const [isLoading, setIsLoading] = React.useState(true);
        const [hasError, setHasError] = React.useState(false);

        console.log('Rendering image with URI:', uri);

        return (
            <View style={styles.imageContainer}>
                {isLoading && !hasError && (
                    <View style={styles.imageLoading}>
                        <ActivityIndicator size="large" color="#00BFA5" />
                    </View>
                )}

                {hasError && (
                    <View style={styles.imageError}>
                        <Ionicons name="image-outline" size={40} color="#ccc" />
                        <Text style={styles.imageErrorText}>Image not available</Text>
                    </View>
                )}

                <Image
                    source={{ uri }}
                    style={[styles.image, hasError && styles.hiddenImage]}
                    resizeMode="cover"
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    onError={(e) => {
                        console.log('Image loading error:', uri, e.nativeEvent.error);
                        setHasError(true);
                        setIsLoading(false);
                    }}
                />
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Render all sections dynamically */}
            {checkListCompleted.map((section, sectionIndex) => (
                <View key={section._id || sectionIndex} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>

                    {Array.isArray(section.items) && section.items.map((item, itemIndex) => {
                        // Handle both string items and object items
                        const itemText = typeof item === 'string' ? item : item.text;
                        const isChecked = typeof item === 'object' ? item.checked : true;
                        const imageUrl = typeof item === 'object' ? item.imageUrl : null;

                        console.log('Item:', itemIndex, 'Text:', itemText, 'Image:', imageUrl);

                        return (
                            <View key={itemIndex} style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Ionicons
                                        name={isChecked ? "checkmark-circle" : "circle-outline"}
                                        size={24}
                                        color={isChecked ? "#4CAF50" : "#666"}
                                    />
                                    <Text style={styles.itemText}>{itemText || 'Task item'}</Text>
                                </View>

                                {imageUrl && <ImageWithLoading uri={imageUrl} />}
                            </View>
                        );
                    })}
                </View>
            ))}
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
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
        marginTop: 8,
        minHeight: 200,
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#f5f5f5',
    },
    hiddenImage: {
        opacity: 0,
    },
    imageLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    imageError: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    imageErrorText: {
        marginTop: 8,
        color: '#999',
    },
}); 