import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const DebugLogger = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;

        console.log = (...args) => {
            originalConsoleLog.apply(console, args);
            setLogs(prev => [...prev, { type: 'log', message: args.join(' ') }]);
        };

        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            setLogs(prev => [...prev, { type: 'error', message: args.join(' ') }]);
        };

        return () => {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
        };
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {logs.map((log, index) => (
                    <Text key={index} style={log.type === 'error' ? styles.errorText : styles.logText}>
                        {log.message}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    scrollView: {
        padding: 10,
    },
    logText: {
        color: 'white',
        fontSize: 12,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
    },
});

export default DebugLogger; 