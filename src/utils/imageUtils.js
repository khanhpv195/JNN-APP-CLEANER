import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const IMAGE_CONFIG = {
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.1,
  maxWidth: 300,
  maxHeight: 300,
};

export const checkImagePermissions = async () => {
  const { status: cameraStatus } =
    await ImagePicker.requestCameraPermissionsAsync();
  const { status: libraryStatus } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (cameraStatus !== "granted" && libraryStatus !== "granted") {
    Alert.alert(
      "Permission Required",
      "Camera and photo library permissions are required"
    );
    return false;
  }
  return true;
};

export const handleImagePicker = async ({
  setImageLoading,
  setFormData,
}) => {
  try {
    const hasPermissions = await checkImagePermissions();
    if (!hasPermissions) return;

    Alert.alert(
      "Select Image",
      "Choose image source",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            setImageLoading(true);
            const result = await takePhoto();
            if (result) {
              setFormData((prev) => ({
                ...prev,
                image: result.uri,
                imageAsset: result.asset,
              }));
            }
            setImageLoading(false);
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            setImageLoading(true);
            const result = await pickFromLibrary();
            if (result) {
              setFormData((prev) => ({
                ...prev,
                image: result.uri,
                imageAsset: result.asset,
              }));
            }
            setImageLoading(false);
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  } catch (error) {
    console.error("Image picker error:", error);
    Alert.alert("Error", "Failed to open image picker");
    setImageLoading(false);
  }
};

export const handleImageUpload = async ({
  imageUri,
  setImageLoading,
  uploadImages,
}) => {
  try {
    setImageLoading(true);

    if (!imageUri || typeof imageUri !== "string") {
      throw new Error("Invalid image URI");
    }

    const uploadFormData = createImageFormData(imageUri);
    const response = await uploadImages(uploadFormData);

    if (!response || !response[0]) {
      throw new Error("Invalid upload response");
    }

    setImageLoading(false);
    return response[0];
  } catch (error) {
    console.error("Error uploading image:", error);
    setImageLoading(false);
    throw error;
  }
};

// Private helper functions
const takePhoto = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync(IMAGE_CONFIG);
    return processImageResult(result);
  } catch (err) {
    console.error("Camera error:", err);
    Alert.alert("Error", "Failed to take photo");
    return null;
  }
};

const pickFromLibrary = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_CONFIG);
    return processImageResult(result);
  } catch (err) {
    console.error("Library error:", err);
    Alert.alert("Error", "Failed to pick image from library");
    return null;
  }
};

const processImageResult = (result) => {
  if (!result.canceled && result.assets && result.assets[0]) {
    return {
      uri: result.assets[0].uri,
      asset: result.assets[0],
    };
  }
  return null;
};

export const createImageFormData = (imageUri) => {
  const formData = new FormData();
  formData.append("files", {
    uri: imageUri,
    type: "image/jpeg",
    name: `inventory-${Date.now()}.jpg`,
  });
  return formData;
};
