import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { USERS } from '@/shared/constants/users';
import Toast from 'react-native-toast-message';
import { useCreateUser, useUsers } from '@/hooks/useUserHook';
// User Item Component
const UserItem = ({ user }) => {
  return (
    <View style={styles.userItem}>
      <View style={styles.userAvatar}>
        <Text style={styles.userInitial}>
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user.fullName || user.email}
        </Text>
        <View style={styles.userDetails}>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userRole}>
            <Text style={styles.userRoleText}>
              {user.permission === USERS.PERMISSION.MASTER ? 'Master' :
                user.permission === USERS.PERMISSION.ADMIN ? 'Admin' :
                  user.permission === USERS.PERMISSION.USER ? 'User' : 'Unknown'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Create User Form Component
const CreateUserForm = ({ onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [permission, setPermission] = useState(USERS.PERMISSION.USER);

  const createUserMutation = useCreateUser();

  const handleCreateUser = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all required fields',
        position: 'bottom',
      });
      return;
    }

    try {
      const userData = {
        firstName,
        lastName,
        email,
        phone,
        password,
        permission
      };

      await createUserMutation.mutateAsync(userData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User created successfully',
        position: 'bottom',
      });

      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setPermission(USERS.PERMISSION.USER);

      // Close form
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create user',
        position: 'bottom',
      });
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create New User</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password *</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={permission}
            onValueChange={(itemValue) => setPermission(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="User" value={USERS.PERMISSION.USER} />
            <Picker.Item label="Admin" value={USERS.PERMISSION.ADMIN} />
          </Picker>
        </View>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateUser}
          disabled={createUserMutation.isLoading}
        >
          {createUserMutation.isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create User</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function UserScreen({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data, isLoading, refetch } = useUsers();
  // Extract users from the data structure
  const users = data?.users || [];
  const pagination = data?.pagination;

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  // Only show the create user button for admins or master users
  const canCreateUsers = user && (user.permission === USERS.PERMISSION.ADMIN ||
    user.permission === USERS.PERMISSION.MASTER);

  // Dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>

        {/* Create User Form or Button */}
        {showCreateForm ? (
          <CreateUserForm
            onClose={() => {
              setShowCreateForm(false);
              refetch(); // Refresh the user list
            }}
          />
        ) : (
          <TouchableOpacity
            style={styles.createUserButton}
            onPress={toggleCreateForm}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.createUserButtonText, { color: theme.primary }]}>Add New User</Text>
          </TouchableOpacity>
        )}

        {/* Users List */}
        <View style={styles.usersListContainer}>
          <Text style={styles.sectionTitle}>
            Users {pagination && `(${pagination.total})`}
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <UserItem user={item} />}
              scrollEnabled={false}
              ListFooterComponent={() => (
                pagination && pagination.hasNextPage ? (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={() => {
                      // Implement pagination loading here
                    }}
                  >
                    <Text style={styles.loadMoreText}>Load More</Text>
                  </TouchableOpacity>
                ) : null
              )}
            />
          )}
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  createUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    marginBottom: 20,
  },
  createUserButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  usersListContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  userItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  userRole: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  userRoleText: {
    fontSize: 12,
    color: '#4B5563',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#4B5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#2563EB',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadMoreButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginTop: 16,
  },
  loadMoreText: {
    color: '#4B5563',
    fontWeight: '500',
  },
});