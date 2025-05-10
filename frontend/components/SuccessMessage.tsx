import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import colors from "../assets/theme/colors";

type Props = {
  message: string | null;
};

export default function SuccessMessage({ message }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current; 
  const [isVisible, setIsVisible] = useState(!!message); 

  useEffect(() => {
    if (message) {
      fadeAnim.setValue(1);
      setIsVisible(true);

      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8485Bf80', 
    borderColor: colors.secondary,
    borderWidth: 3, 
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
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
