import React from "react";
import { View } from "react-native";
import EditableContent from "@/components/EditableContent";

const Detail = ({ detail, onUpdate }) => {
  const handleSave = (newDetail) => {
    // Gọi API để cập nhật detail
    onUpdate && onUpdate('detail', newDetail);
  };

  return (
    <View>
      <EditableContent
        title="Detail"
        content={detail}
        onSave={handleSave}
        placeholder="Enter property details..."
      />
    </View>
  );
};

export default Detail;