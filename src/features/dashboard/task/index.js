import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

import TaskCard from '@/components/TaskCard';
import Loading from '@/components/ui/Loading';
import Toast from 'react-native-toast-message';
import TaskDetailModal from '@/components/TaskDetailModal';

import {
  useFetchTasks,
  useUpdateTask as useUpdateTaskStatus,
  useDeleteTask
} from '@/hooks/useTask';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Tasks' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' }
];

const TaskComponent = ({ route }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // Add state for TaskDetailModal
  const [isTaskDetailModalVisible, setIsTaskDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Get tasks with filters
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useFetchTasks(
    {
      page,
      limit: ITEMS_PER_PAGE,
      status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
      search: searchQuery || undefined,
      supportId: route?.params?.onlyMine ? user?._id : undefined
    },
    {
      enabled: true
    }
  );

  // Task update mutation
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  // Extract tasks and pagination
  const tasksList = data?.data?.tasks || [];
  const totalTasks = data?.data?.pagination?.total || 0;
  const hasMore = data?.data?.pagination?.hasNextPage || false;

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  // Filter handlers
  const applyFilters = useCallback(() => {
    setPage(1);
    setIsFilterModalVisible(false);
    refetch();
  }, [refetch, statusFilter, searchQuery]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setStatusFilter('all');
    setSearchQuery('');
    setPage(1);
    refetch();
    setIsFilterModalVisible(false);
  }, [refetch]);

  // Create task handler
  const handleCreateTask = useCallback(() => {
    navigation.navigate('CreateTask');
  }, [navigation]);

  // Load more handler
  const loadMoreTasks = useCallback(() => {
    if (hasMore && !isRefetching && !refreshing) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isRefetching, refreshing]);

  // Task action handlers
  const handleEditTask = useCallback((task) => {
    navigation.navigate('CreateTask', { taskId: task._id });
  }, [navigation]);

  // Modify handleViewDetails to use TaskDetailModal
  const handleViewDetails = useCallback((task) => {
    setSelectedTaskId(task._id);
    setIsTaskDetailModalVisible(true);
  }, []);

  // Cập nhật hàm handleTaskPress để mở TaskDetailModal trực tiếp
  const handleTaskPress = useCallback((task) => {
    setSelectedTaskId(task._id);
    setIsTaskDetailModalVisible(true);
  }, []);

  // Hàm xử lý khi task được cập nhật từ modal
  const handleTaskUpdated = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleDeleteTask = useCallback((task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask.mutateAsync(task._id);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Task deleted successfully',
              });
              handleRefresh();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete task',
              });
            }
          }
        }
      ]
    );
  }, [deleteTask, handleRefresh]);

  const handleUpdateStatus = useCallback(async (task, newStatus) => {
    try {
      await updateTaskStatus.mutateAsync({
        taskId: task._id,
        status: newStatus
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Task marked as ${newStatus.toLowerCase()}`,
      });

      setIsTaskDetailModalVisible(false);
      setSelectedTaskId(null);
      handleRefresh();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update task status',
      });
    }
  }, [updateTaskStatus, handleRefresh]);

  // Check if user can update status
  const canUpdateStatus = useCallback((task) => {
    // Only the assigned support user can update status
    return task.supportId === user?._id;
  }, [user]);

  // Show loading only on initial fetch
  if (isLoading && !isRefetching && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with title and filter button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={22} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTask}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status filter tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {STATUS_FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.tabButton,
                statusFilter === filter.id && styles.activeTabButton
              ]}
              onPress={() => {
                setStatusFilter(filter.id);
                setPage(1);
                refetch();
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  statusFilter === filter.id && styles.activeTabButtonText
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={applyFilters}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setPage(1);
              refetch();
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tasks count */}
      <View style={styles.resultInfo}>
        <Text style={styles.resultCount}>
          {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} found
        </Text>
      </View>

      {/* Tasks List */}
      <View style={styles.listContainer}>
        {tasksList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try changing your filters'
                : 'Create a new task to get started'}
            </Text>

            {/* Refresh button when no tasks are found */}
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color="#FFFFFF"
                style={refreshing ? styles.rotatingIcon : null}
              />
              <Text style={styles.refreshButtonText}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={tasksList}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TaskCard
                item={{
                  ...item,
                  title: item.title || 'Untitled Task',
                  description: item.description || ''
                }}
                onPress={() => handleTaskPress(item)}
                style={styles.taskCard}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            onEndReached={loadMoreTasks}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => (
              hasMore && isRefetching && !refreshing ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              ) : null
            )}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Tasks</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {STATUS_FILTERS.map(filter => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterOption,
                      statusFilter === filter.id && styles.selectedFilterOption
                    ]}
                    onPress={() => setStatusFilter(filter.id)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        statusFilter === filter.id && styles.selectedFilterOptionText
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Assigned To</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    !route?.params?.onlyMine && styles.selectedFilterOption
                  ]}
                  onPress={() => navigation.setParams({ onlyMine: false })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      !route?.params?.onlyMine && styles.selectedFilterOptionText
                    ]}
                  >
                    All Users
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    route?.params?.onlyMine && styles.selectedFilterOption
                  ]}
                  onPress={() => navigation.setParams({ onlyMine: true })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      route?.params?.onlyMine && styles.selectedFilterOptionText
                    ]}
                  >
                    Only My Tasks
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TaskDetailModal */}
      <TaskDetailModal
        visible={isTaskDetailModalVisible}
        taskId={selectedTaskId}
        onClose={() => {
          setIsTaskDetailModalVisible(false);
          setSelectedTaskId(null);
        }}
        onTaskUpdated={handleTaskUpdated}
      />

      <Toast />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  createButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTabButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#4B5563',
  },
  clearButton: {
    padding: 6,
  },
  resultInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingBottom: 16,
  },
  taskCard: {
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingMore: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
  },
  emptySubtext: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  rotatingIcon: {
    transform: [{ rotate: '45deg' }],
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  // Filter modal styles
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  selectedFilterOptionText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default TaskComponent;