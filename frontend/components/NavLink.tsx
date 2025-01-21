import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../assets/theme/colors';

interface NavLinkProps {
  text: string;
  targetTab: string;
  style?: object;
  textStyle?: object;
}

const NavLink: React.FC<NavLinkProps> = ({ text, targetTab, style, textStyle }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate(targetTab as never);
  };

  return (
    <Pressable onPress={handlePress} style={style}>
      <Text style={[styles.linkText, textStyle]}>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  linkText: {
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
});

export default NavLink;
