import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { ViewStyle, TextStyle } from 'react-native'
import colors from '../assets/theme/colors';

interface CardProps {
    children: ReactNode;
    style?: ViewStyle;
    contentStyle?: ViewStyle | TextStyle;
}

const Card: React.FC<CardProps> = ({ children, style, contentStyle }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.cardContent, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 5,
    shadowRadius: 4,
    marginBottom: 15,
  },
  cardContent: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Card;
