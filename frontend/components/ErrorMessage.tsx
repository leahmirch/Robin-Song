import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
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
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(heightAnim, {
            toValue: 0,
            duration: 2000,
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
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary, 
    borderColor: colors.secondary,
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
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Radio Canada",
    textAlign: "center",
  },
});
