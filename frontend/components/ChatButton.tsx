import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../assets/theme/colors';

interface ChatButtonProps {
  onPress: () => void;
  position?: {
    bottom?: number;
    right?: number;
    left?: number;
  };
}

const ChatButton: React.FC<ChatButtonProps> = ({ onPress, position }) => {
  return (
    <TouchableOpacity
      style={[styles.button, position && { ...position }]}
      onPress={onPress}
    >
        <MaterialCommunityIcons name="bird" size={30} color={ colors.black } />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 94,
    right: 15,
    backgroundColor: colors.accent,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(192, 72, 58, 0.2)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: colors.text,
    fontWeight: 'bold',
  },
});

export default ChatButton;
