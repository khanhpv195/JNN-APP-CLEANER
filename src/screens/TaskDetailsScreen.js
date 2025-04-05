import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, ToastAndroid, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChecklistModal from '../components/ChecklistModal';
import { format } from 'date-fns';
import { useReservation } from '../hooks/useReservation';
import { STATUS } from '../constants/status';
import { useFocusEffect } from '@react-navigation/native';

export default function TaskDetailsScreen({ route, navigation }) {
    const [showChecklist, setShowChecklist] = useState(false);
    const [task, setTask] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { loading, error, getTaskDetails, fetching, setFetching, updateTask } = useReservation();
    const [taskId, setTaskId] = useState(null);


    const refreshData = () => {
        fetchTaskDetails();
    };

    useFocusEffect(
        React.useCallback(() => {
            refreshData();
        }, [])
    );


    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    style={{ marginLeft: 16 }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            ),
            headerShown: true
        });
        setTaskId(route.params.taskId);
        fetchTaskDetails();
    }, [route.params?.taskId]);

    const fetchTaskDetails = async () => {
        try {
            if (!route.params?.taskId) {
                console.error('No taskId provided in fetchTaskDetails');
                return;
            }

            const response = await getTaskDetails(route.params.taskId);
            setTask(response);

        } catch (error) {
            console.error('Error fetching task details:', error);
        }
    };




    const getStatusColor = (status) => {
        switch (status) {
            case STATUS.PENDING:
                return '#FFA000'; // Orange
            case STATUS.IN_PROGRESS:
                return '#1976D2'; // Blue
            case STATUS.COMPLETED:
                return '#4CAF50'; // Green
            default:
                return '#666'; // Gray
        }
    };

    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(message);
        }
    };

    const handleAcceptTask = async () => {
        try {
            setIsSubmitting(true);
            const response = await updateTask(task._id, {
                status: 'IN_PROGRESS'
            });

            if (response?.success) {
                setTask(response.data);
                showToast(response.message);
            } else {
                showToast(response.message || 'Failed to accept task');
            }
        } catch (error) {
            console.error('Error accepting task:', error);
            showToast('Failed to accept task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteChecklist = async (checklistData) => {
        try {
            setIsSubmitting(true);
            const response = await updateTask(task._id, {
                status: 'COMPLETED',
                checklist: checklistData
            });

            if (response?.success) {
                setTask(response.data);
                setShowChecklist(false);
                showToast(response.message);
            } else {
                showToast(response.message || 'Failed to complete checklist');
            }
        } catch (error) {
            console.error('Error completing checklist:', error);
            showToast('Failed to complete checklist');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePropertyProblem = () => {
        if (!taskId) {
            console.error('No taskId available');
            window.alert('Task information not available');
            return;
        }

        const navigationParams = {
            taskId: taskId,
            propertyId: task?.propertyId,
            problems: task?.propertyProblems
        };

        navigation.navigate('PropertyProblem', navigationParams);
    };

    useEffect(() => {
        if (!route.params?.taskId) {
            console.error('TaskDetailsScreen - No taskId in route params');
            window.alert('Missing required task information');
            navigation.goBack();
        }
    }, [route]);


    const renderCompletedChecklist = () => {
        const checkListCompleted = task?.propertyDetails?.checkListCompleted;
        if (!checkListCompleted || checkListCompleted.length === 0) return null;

        return (
            <TouchableOpacity
                style={styles.detailItem}
                onPress={() => {
                    navigation.navigate('CompletedChecklist', {
                        checkListCompleted: checkListCompleted
                    });
                }}
            >

                <Ionicons name="images" size={24} color="#666" />
                <Text style={styles.detailText}>Cleaning Images</Text>
                <Text style={styles.detailCount}>
                    {checkListCompleted.reduce((total, section) =>
                        total + section.items.filter(item => item.imageUrl).length, 0
                    )}
                </Text>
                <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
        );
    };

    const CleanerUI = ({ task, isSubmitting, handleAcceptTask, setShowChecklist, renderCompletedChecklist }) => {
        return (
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.projectId}>
                        Project #{task?._id?.slice(-8) || 'N/A'}
                    </Text>
                    <Text style={styles.projectTitle}>
                        {task?.propertyDetails?.name || 'Unknown Property'}
                    </Text>
                </View>

                {/* Type Badge */}
                <View style={styles.typeBadge}>
                    <Ionicons name="water" size={20} color="#666" />
                    <Text style={styles.typeText}>{task?.type || 'N/A'}</Text>
                </View>

                {/* Time Section */}
                <View style={styles.timeSection}>
                    <View style={styles.timeColumn}>
                        <Text style={styles.timeLabel}>Check In</Text>
                        <Text style={styles.timeValue}>
                            {task?.reservationDetails?.checkIn ?
                                format(new Date(task.reservationDetails.checkIn), 'h:mm a')
                                : 'N/A'}
                        </Text>
                        <Text style={styles.dateText}>
                            {task?.reservationDetails?.checkIn ?
                                format(new Date(task.reservationDetails.checkIn), 'EEE, MMM d yyyy')
                                : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.timeColumn}>
                        <Text style={styles.timeLabel}>Check Out</Text>
                        <Text style={styles.timeValue}>
                            {task?.reservationDetails?.checkOut ?
                                format(new Date(task.reservationDetails.checkOut), 'h:mm a')
                                : 'N/A'}
                        </Text>
                        <Text style={styles.dateText}>
                            {task?.reservationDetails?.checkOut ?
                                format(new Date(task.reservationDetails.checkOut), 'EEE, MMM d yyyy')
                                : 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Status Tags */}
                <View style={styles.statusTags}>
                    {task?.status && (
                        <View style={[styles.statusTag, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                            <Ionicons
                                name={task.status === STATUS.COMPLETED ? "checkmark-circle" : "time"}
                                size={20}
                                color={getStatusColor(task.status)}
                            />
                            <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                                {task.status}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Details List */}
                <View style={styles.detailsList}>
                    <TouchableOpacity style={styles.detailItem}>
                        <Ionicons name="location" size={24} color="#666" />
                        <Text style={styles.detailText}>
                            {task?.propertyDetails?.address || 'No address available'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.detailItem}>
                        <Ionicons name="cash" size={24} color="#666" />
                        <Text style={styles.detailText}>Cleaning Price</Text>
                        <Text style={styles.priceText}>
                            ${(task?.price?.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </Text>
                    </View>

                    <View style={styles.detailItem}>
                        <Ionicons name="key" size={24} color="#666" />
                        <Text style={styles.detailText}>Access Code</Text>
                        <View style={styles.codeContainer}>
                            <Text style={styles.codeText}>
                                {task?.propertyDetails?.access_code || 'N/A'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.detailItem}
                        onPress={handlePropertyProblem}
                    >
                        <Ionicons name="alert-circle" size={24} color="#666" />
                        <Text style={styles.detailText}>Property Problems</Text>
                        <View style={styles.problemBadge}>
                            <Text style={styles.problemCount}>
                                {task?.propertyProblems?.length || 0}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>


                    {renderCompletedChecklist()}
                    {/* Accept Button - only show when status is PENDING */}
                    {task?.status === STATUS.PENDING && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.acceptButton,
                                isSubmitting && styles.disabledButton
                            ]}
                            onPress={handleAcceptTask}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.actionButtonText}>
                                {isSubmitting ? 'Processing...' : 'Accept Task'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Complete Checklist Button - only show when status is IN_PROGRESS */}
                    {task?.status === STATUS.IN_PROGRESS && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.checklistButton,
                                isSubmitting && styles.disabledButton
                            ]}
                            onPress={() => setShowChecklist(true)}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.actionButtonText}>
                                {isSubmitting ? 'Processing...' : 'Complete Checklist'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        );
    };

    const MaintenanceUI = ({ task, isSubmitting, handleAcceptTask }) => {
        return (
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.projectId}>
                        Maintenance #{task?._id?.slice(-8) || 'N/A'}
                    </Text>
                    <Text style={styles.projectTitle}>
                        {task?.propertyDetails?.name || 'Unknown Property'}
                    </Text>
                </View>

                {/* Type Badge */}
                <View style={styles.typeBadge}>
                    <Ionicons name="build" size={20} color="#666" />
                    <Text style={styles.typeText}>{task?.type || 'N/A'}</Text>
                </View>

                {/* Status Tags */}
                <View style={styles.statusTags}>
                    {task?.status && (
                        <View style={[styles.statusTag, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                            <Ionicons
                                name={task.status === STATUS.COMPLETED ? "checkmark-circle" : "time"}
                                size={20}
                                color={getStatusColor(task.status)}
                            />
                            <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                                {task.status}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Details List */}
                <View style={styles.detailsList}>
                    {/* Description */}
                    {task?.description && (
                        <View style={styles.detailItem}>
                            <Ionicons name="document-text" size={24} color="#666" />
                            <Text style={styles.detailText}>
                                {task.description}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.detailItem}>
                        <Ionicons name="location" size={24} color="#666" />
                        <Text style={styles.detailText}>
                            {task?.propertyDetails?.address || 'No address available'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.detailItem}>
                        <Ionicons name="key" size={24} color="#666" />
                        <Text style={styles.detailText}>Access Code</Text>
                        <View style={styles.codeContainer}>
                            <Text style={styles.codeText}>
                                {task?.propertyDetails?.access_code || 'N/A'}
                            </Text>
                        </View>
                    </View>

                    {/* Accept Button - only show when status is PENDING */}
                    {task?.status === STATUS.PENDING && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.acceptButton,
                                isSubmitting && styles.disabledButton
                            ]}
                            onPress={handleAcceptTask}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.actionButtonText}>
                                {isSubmitting ? 'Processing...' : 'Accept Maintenance Task'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Complete Checklist Button - only show when status is IN_PROGRESS */}
                    {task?.status === STATUS.IN_PROGRESS && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.checklistButton,
                                isSubmitting && styles.disabledButton
                            ]}
                            onPress={() => setShowChecklist(true)}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.actionButtonText}>
                                {isSubmitting ? 'Processing...' : 'Complete Checklist'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        );
    };

    return (
        <>
            {loading && (
                <View style={[styles.container, styles.centerContent]}>
                    <ActivityIndicator size="large" color="#00BFA5" />
                </View>
            )}

            {error && (
                <View style={[styles.container, styles.centerContent]}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchTaskDetails}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && !task && (
                <View style={[styles.container, styles.centerContent]}>
                    <Text>Task not found</Text>
                </View>
            )}

            {!loading && !error && task && (
                <>
                    {task.type === 'CLEANING' ? (
                        <CleanerUI
                            task={task}
                            isSubmitting={isSubmitting}
                            handleAcceptTask={handleAcceptTask}
                            setShowChecklist={setShowChecklist}
                            renderCompletedChecklist={renderCompletedChecklist}
                        />
                    ) : (
                        <MaintenanceUI
                            task={task}
                            isSubmitting={isSubmitting}
                            handleAcceptTask={handleAcceptTask}
                        />
                    )}

                    <ChecklistModal
                        visible={showChecklist}
                        onClose={() => setShowChecklist(false)}
                        onComplete={handleCompleteChecklist}
                        loading={isSubmitting}
                        checkList={task?.propertyDetails?.check_list || []}
                    />
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#00BFA5',
    },
    projectId: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    projectTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    teamRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamLabel: {
        color: 'white',
        fontSize: 16,
    },
    teamName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    ratingContainer: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        padding: 10,
        borderRadius: 20,
        margin: 20,
    },
    typeText: {
        marginLeft: 5,
        color: '#666',
        fontWeight: '500',
    },
    timeSection: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 10,
        justifyContent: 'space-around',
    },
    timeColumn: {
        alignItems: 'center',
        flex: 1,
    },
    timeLabel: {
        color: '#666',
        fontSize: 16,
        marginBottom: 5,
    },
    timeValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    dateText: {
        color: '#666',
        fontSize: 14,
        marginTop: 2,
    },
    requestedTime: {
        color: '#666',
        fontSize: 12,
        marginTop: 5,
        fontStyle: 'italic',
    },
    statusTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        gap: 10,
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 20,
    },
    statusText: {
        marginLeft: 5,
        color: '#4CAF50',
        fontWeight: '500',
    },
    detailsList: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    detailCount: {
        marginHorizontal: 10,
        color: '#666',
    },
    checklistButton: {
        backgroundColor: '#00BFA5',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    checklistButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#00BFA5',
        padding: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    actionButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    acceptButton: {
        backgroundColor: '#1976D2', // Blue
    },
    checklistButton: {
        backgroundColor: '#00BFA5', // Green
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00BFA5',
        marginLeft: 'auto',
    },
    codeContainer: {
        marginLeft: 'auto',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    codeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        letterSpacing: 1,
    },
    problemBadge: {
        backgroundColor: '#FF5252',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginHorizontal: 8,
    },
    problemCount: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
}); 