import React from "react";
import { View } from "react-native";
import EditableContent from "@/components/EditableContent";

const CommonProblem = ({ commonProblems, onUpdate }) => {
  const handleSave = (newCommonProblems) => {
    // Gọi API để cập nhật common problems
    onUpdate && onUpdate('common_problems', newCommonProblems);
  };

  return (
    <View>
      <EditableContent
        title="Common Problems"
        content={commonProblems}
        onSave={handleSave}
        placeholder="Enter common problems..."
      />
    </View>
  );
};

export default CommonProblem;
