import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import { useTaskDetail, useUpdateTaskCleaner } from '@/hooks/useTask';
import Loading from '@/components/ui/Loading';

const { height } = Dimensions.get('window');

const TaskStatusBadge = ({ status }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'PENDING':
                return { bg: '#FEF3C7', text: '#D97706' };
            case 'IN_PROGRESS':
                return { bg: '#DBEAFE', text: '#2563EB' };
            case 'COMPLETED':
                return { bg: '#D1FAE5', text: '#059669' };
            case 'CANCELLED':
                return { bg: '#FEE2E2', text: '#DC2626' };
            default:
                return { bg: '#F3F4F6', text: '#6B7280' };
        }
    };

    const colors = getStatusColor();

    return (
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{status.replace('_', ' ')}</Text>
        </View>
    );
};

const TaskDetailModal = ({ visible, taskId, onClose, onTaskUpdated }) => {
    const [refreshKey, setRefreshKey] = useState(0);
    const navigation = useNavigation();

    // Add more detailed console logs
    console.log('TaskDetailModal received taskId:', taskId);

    // Fetch task details
    const {
        data: taskData,
        isLoading,
        isError,
        error,
        refetch,
    } = useTaskDetail(taskId, {
        enabled: !!taskId && visible,
    });

    // Add detailed logging of the response

    // Extract task from the response - check the correct path
    const task = taskData?.data;

    console.log('Task data extracted:', task);

    // Update task status mutation
    const {
        mutate: updateTaskStatus,
        isLoading: isUpdating,
    } = useUpdateTaskCleaner();

    // Add debug logging

    // Add a function to handle lead click
    const handleLeadPress = (leadId) => {
        if (!leadId) return;

        // Close the modal first
        onClose();

        // Navigate to lead detail screen
        setTimeout(() => {
            navigation.navigate('CRM', {
                screen: 'lead',
                params: {
                    screen: 'lead_detail',
                    params: { leadId: leadId?._id }
                }
            });
        }, 300); // Small delay to allow modal to close smoothly
    };

    // Handle accept task
    const handleAcceptTask = () => {
        if (isUpdating) return;

        Alert.alert(
            "Accept Task",
            "Are you sure you want to accept this task?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Accept",
                    onPress: () => {
                        updateTaskStatus(
                            { taskId, status: 'IN_PROGRESS' },
                            {
                                onSuccess: () => {
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Task accepted successfully',
                                    });
                                    setRefreshKey(prev => prev + 1);
                                    refetch();
                                    if (onTaskUpdated) onTaskUpdated();
                                },
                                onError: (err) => {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Failed to accept task',
                                        text2: err.message || 'Please try again',
                                    });
                                },
                            }
                        );
                    },
                },
            ]
        );
    };

    // Handle complete task
    const handleCompleteTask = () => {
        if (isUpdating) return;

        Alert.alert(
            "Complete Task",
            "Are you sure you want to mark this task as completed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Complete",
                    onPress: () => {
                        updateTaskStatus(
                            { taskId, status: 'COMPLETED' },
                            {
                                onSuccess: () => {
                                    Toast.show({
                                        type: 'success',
                                        text1: 'Task completed successfully',
                                    });
                                    setRefreshKey(prev => prev + 1);
                                    refetch();
                                    if (onTaskUpdated) onTaskUpdated();
                                },
                                onError: (err) => {
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Failed to complete task',
                                        text2: err.message || 'Please try again',
                                    });
                                },
                            }
                        );
                    },
                },
            ]
        );
    };

    // Modal content based on loading/error states
    const renderModalContent = () => {
        // Loading state
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <Loading />
                </View>
            );
        }

        // Error state
        if (isError) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
                    <Text style={styles.errorText}>Error loading task details</Text>
                    <Text style={styles.errorSubtext}>{error?.message || 'Please try again'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // No task found
        if (!task) {
            return (
                <View style={styles.errorContainer}>
                    <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.errorText}>Task data not found</Text>
                    <Text style={styles.errorSubtext}>The API response doesn't contain task data</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Task details content
        return (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Task Type and Status */}
                <View style={styles.statusContainer}>
                    <View style={styles.typeContainer}>
                        <Ionicons
                            name={task.type === 'SUPPORT' ? 'help-circle-outline' : 'build-outline'}
                            size={24}
                            color="#4B5563"
                        />
                        <Text style={styles.typeText}>{task.type}</Text>
                    </View>
                    <TaskStatusBadge status={task.status} />
                </View>

                {/* Task Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{task.description}</Text>
                </View>

                {/* Task Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>

                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>
                                {format(new Date(task.date), 'MMM dd, yyyy')}
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <Ionicons name="time-outline" size={20} color="#6B7280" />
                            <Text style={styles.detailLabel}>Time</Text>
                            <Text style={styles.detailValue}>
                                {format(new Date(task.date), 'HH:mm')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Lead Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lead Information</Text>

                    <TouchableOpacity
                        style={styles.infoRow}
                        onPress={() => handleLeadPress(task.leadId)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="person-outline" size={20} color="#6B7280" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Lead ID</Text>
                            <View style={styles.leadValueContainer}>
                                <Text style={styles.infoValue}>
                                    {typeof task.leadId === 'object' && task.leadId?.name
                                        ? task.leadId.name
                                        : task.leadId || 'N/A'}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Assigned To */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Assigned To</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color="#6B7280" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>User ID</Text>
                            <Text style={styles.infoValue}>
                                {typeof task.userId === 'object' && task.userId?.fullName
                                    ? task.userId.fullName
                                    : task.userId || 'Unassigned'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    {task.status === 'PENDING' && (
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={handleAcceptTask}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.buttonText}>Accept Task</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                        <TouchableOpacity
                            style={styles.completeButton}
                            onPress={handleCompleteTask}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-done-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.buttonText}>Complete Task</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Task Details</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    {renderModalContent()}
                </View>
            </View>
            <Toast />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.85,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    closeButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4B5563',
        marginTop: 16,
    },
    errorSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        marginTop: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '500',
    },
    actionsContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        borderRadius: 8,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    leadValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
});

export default TaskDetailModal; 