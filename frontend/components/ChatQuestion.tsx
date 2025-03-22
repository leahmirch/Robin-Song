import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  GestureResponderEvent, 
  ViewStyle, 
  TextStyle,
  View,
} from 'react-native';
import colors from '../assets/theme/colors';

interface ChatQuestionProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const ChatQuestion: React.FC<ChatQuestionProps> = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity
      accessibilityLabel={`Question suggestion: ${title}. Double tap to ask this question.`}
      accessibilityRole='button'
      style={[styles.button, style]}
      onPress={onPress}
    >
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: `${colors.accent}90`,
    borderRadius: 20,
    justifyContent: 'center',
    marginVertical: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Radio Canada',
    color: colors.black,
  },
});

export default ChatQuestion;
