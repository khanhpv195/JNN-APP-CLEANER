import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { 
  CameraIcon, 
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from 'react-native-heroicons/outline';

const { width, height } = Dimensions.get('window');

const PhotosTab = ({ task }) => {
  const { theme } = useTheme();
  const photos = task?.completionDetails?.photos || [];
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    photoContainer: {
      width: (width - 48) / 3,
      height: (width - 48) / 3,
      marginBottom: 8,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    emptyState: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      marginVertical: 16,
      height: 200,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalImage: {
      width: width * 0.9,
      height: height * 0.6,
      borderRadius: 8,
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      padding: 8,
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: width * 0.9,
      position: 'absolute',
      bottom: 40,
    },
    navButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      padding: 12,
    },
    photoCounter: {
      position: 'absolute',
      bottom: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    photoCounterText: {
      color: 'white',
      fontSize: 14,
    },
  });

  const handlePhotoPress = (photo, index) => {
    setSelectedPhoto(photo);
    setPhotoIndex(index);
  };

  const handleClose = () => {
    setSelectedPhoto(null);
  };

  const handlePrevious = () => {
    setPhotoIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
    setSelectedPhoto(photos[photoIndex === 0 ? photos.length - 1 : photoIndex - 1]);
  };

  const handleNext = () => {
    setPhotoIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
    setSelectedPhoto(photos[photoIndex === photos.length - 1 ? 0 : photoIndex + 1]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Photos</Text>
      
      {photos.length > 0 ? (
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.photoContainer}
              onPress={() => handlePhotoPress(photo, index)}
            >
              <Image
                source={{ uri: photo.url }}
                style={styles.photo}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <CameraIcon 
            size={48} 
            color={theme.textSecondary} 
            style={styles.emptyIcon} 
          />
          <Text style={styles.emptyText}>
            No photos available for this task
          </Text>
        </View>
      )}
      
      {/* Photo Viewer Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto.url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
          
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <XMarkIcon size={24} color="white" />
          </TouchableOpacity>
          
          {photos.length > 1 && (
            <View style={styles.navigationButtons}>
              <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                <ArrowLeftIcon size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                <ArrowRightIcon size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>
              {photoIndex + 1} / {photos.length}
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PhotosTab;