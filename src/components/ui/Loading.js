import React from "react";
import { StyleSheet } from "react-native";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/shared/theme";

const Loading = () => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size={"large"} color={theme.accent} />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});