import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../assets/theme/colors";

type Props = {
  message: string | null;
};

export default function ErrorMessage({ message }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current; 
  const heightAnim = useRef(new Animated.Value(50)).current; 
  const [isVisible, setIsVisible] = useState(!!message); 

  useEffect(() => {
    if (message) {
      fadeAnim.setValue(1);
      heightAnim.setValue(50);
      setIsVisible(true);

      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: false,
          }),
          Animated.timing(heightAnim, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: false, 
          }),
        ]).start(() => setIsVisible(false)); 
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [message]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, height: heightAnim }]}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={24}
        color={colors.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card, 
    borderColor: colors.chatGPTBackground,
    borderWidth: 3, 
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center", 
    minHeight: 50, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    overflow: "hidden",
  },
  text: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Radio Canada",
    textAlign: "center",
  },
  icon: {
    marginRight: 4,
  },
});
