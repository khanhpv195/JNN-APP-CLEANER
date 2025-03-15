import React, { useState, useRef } from 'react';
import { View, PanResponder, Text } from 'react-native';

function AircallComponent() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const viewRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        setPosition({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      onPanResponderRelease: () => {
        // Save position when released
      },
    })
  ).current;

  return (
    <View
      ref={viewRef}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        {...panResponder.panHandlers}
        style={{
          width: 300,
          height: 500,
          transform: [{ translateX: position.x }, { translateY: position.y }],
          borderRadius: 10,
          backgroundColor: '#fff',
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Phone UI</Text>
        </View>
      </View>
    </View>
  );
}

export default AircallComponent;