import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Image } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../assets/theme/colors';

interface ChatButtonProps {
  onPress: () => void;
  position?: {
    bottom?: number;
    right?: number;
    left?: number;
  };
  hiddenScreens?: string[];
  style?: ViewStyle;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onPress, position, hiddenScreens = [], style }) => {
  const currentRouteName = useNavigationState((state: any) => {
    if (state && Array.isArray(state.routes) && typeof state.index === 'number') {
      return state.routes[state.index]?.name as string;
    }
    return '';
  });

  if (hiddenScreens.includes(currentRouteName)) {
    return null;
  }
  
  return (
    <TouchableOpacity
      accessibilityLabel='Talk with Robin chatbot'
      accessibilityHint='Double tap to open the screen to talk to the Robin chatbot.'
      accessibilityRole='button'
      style={[
        styles.button, 
        position && { ...position },
        style,
      ]}
      onPress={onPress}
    >
    <Image source={require('../assets/img/chatbotlogo.png')} style={styles.logoImage} />
        </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 15,
    backgroundColor: colors.accent,
    padding: 8,
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
  logoImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
});

export default ChatButton;
