import React, { useState, useRef } from 'react';
import { 
  View,
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity,
  LayoutAnimation,
  Animated,
  Platform,
  UIManager,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../assets/theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ToggleProps {
  title: string;
  startIcon: string;
  initialValue?: boolean;
  description?: string;
  onToggle?: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ title, startIcon, initialValue = false, description, onToggle }) => {
  const [isToggled, setIsToggled] = useState(initialValue);
  const [showDescription, setShowDescription] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const handleToggle = (value: boolean) => {
    setIsToggled(value);
    if (onToggle) {
      onToggle(value);
    }
  };

  const toggleDescription = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  
    Animated.timing(expandAnim, {
      toValue: isToggled ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowDescription(!showDescription);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name={startIcon}
          size={24}
          color={colors.secondary}
          style={styles.iconStart}
        />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.toggleContainer}>
          <Switch
            value={isToggled}
            onValueChange={handleToggle}
            thumbColor={colors.bottomnav}
            trackColor={{ true: colors.secondary, false: colors.bottomnav }}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.infoBox} onPress={toggleDescription}>
        <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={colors.accent}
            style={styles.iconStart}
          />
        <Text style={styles.infoText}>What is this?</Text>
      </TouchableOpacity>
      {showDescription && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    padding: 15,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
  },
  title: {
    fontFamily: 'Radio Canada',
    fontSize: 18,
    color: colors.text,
    flex: 1,
    marginLeft: 10,
  },
  iconStart: {
    marginRight: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },
  infoBox: {
    flexDirection: "row",
    paddingLeft: 15,
    paddingBottom: 15,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: colors.accent,
  },
  descriptionContainer: {
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
  },
});

export default Toggle;
