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

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'card';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', style, textStyle, icon }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'card' && styles.card,
        style,
      ]}
      onPress={onPress}
    >
      {variant === 'card' && icon ? (
        <View style={styles.cardContent}>
          {icon}
          <Text style={[styles.buttonText, styles.cardText, textStyle]}>{title}</Text>
        </View>
      ) : (
      <Text style={[
        styles.buttonText,
        variant === 'primary' && styles.primaryText,
        variant === 'secondary' && styles.secondaryText,
        variant === 'card' && styles.cardText,
        textStyle,
      ]}>
        {title}
      </Text>
    )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.accent,
  },
  card: {
    backgroundColor: colors.form,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Radio Canada'
  },
  primaryText: {
    color: colors.offwhite,
  },
  secondaryText: {
    color: colors.offwhite,
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'regular',
    color: colors.accent,
    marginLeft: 12,
  }
});

export default Button;
