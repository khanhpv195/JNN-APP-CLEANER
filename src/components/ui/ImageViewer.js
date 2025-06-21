import React, { useState } from 'react';
import { View, Image, Modal, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "react-native-heroicons/outline";

const { width, height } = Dimensions.get('window');

const ImageViewer = ({ imageUrls, isVisible, onClose, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = () => {
        if (currentIndex < imageUrls.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const renderItem = ({ item }) => (
        <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
            <Image
                source={{ uri: item.url }}
                style={{ width: width * 0.9, height: height * 0.7, resizeMode: 'contain' }}
            />
        </View>
    );

    return (
        <Modal visible={isVisible} transparent={true} animationType="fade">
            <View style={{/* was: className="flex-1 bg-black/90 justify-center items-center" */}}>
                <TouchableOpacity
                    style={{/* was: className="absolute top-10 right-5 z-10 bg-gray-800/50 rounded-full p-2" */}}
                    onPress={onClose}
                >
                    <XMarkIcon size={24} color="white" />
                </TouchableOpacity>

                <FlatList
                    data={imageUrls}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    initialScrollIndex={initialIndex}
                    getItemLayout={(data, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                        const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
                        setCurrentIndex(newIndex);
                    }}
                />

                {imageUrls.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <TouchableOpacity
                                style={{/* was: className="absolute left-5 bg-gray-800/50 rounded-full p-2" */}}
                                onPress={handlePrevious}
                            >
                                <ChevronLeftIcon size={30} color="white" />
                            </TouchableOpacity>
                        )}

                        {currentIndex < imageUrls.length - 1 && (
                            <TouchableOpacity
                                style={{/* was: className="absolute right-5 bg-gray-800/50 rounded-full p-2" */}}
                                onPress={handleNext}
                            >
                                <ChevronRightIcon size={30} color="white" />
                            </TouchableOpacity>
                        )}

                        <View style={{/* was: className="absolute bottom-10 flex-row" */}}>
                            {imageUrls.map((_, index) => (
                                <View
                                    key={index}
                                    className={`h-2 w-2 rounded-full mx-1 ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
                                />
                            ))}
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
};

export default ImageViewer;