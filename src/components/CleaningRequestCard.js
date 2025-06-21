import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const CleaningRequestCard = ({ item }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.id}>{item.id}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{item.timeRange}</Text>
            <Text style={styles.time}>{item.timeEnd}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={[
                styles.status,
                {
                    color: item.status === 'Hoàn thành' ? '#4CAF50' :
                        item.status === 'Đang thực hiện' ? '#2196F3' : '#FFC107'
                }
            ]}>{item.status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    id: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    time: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    description: {
        fontSize: 16,
        marginVertical: 5,
    },
    status: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },
});