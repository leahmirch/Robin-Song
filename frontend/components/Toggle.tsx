import React, { useState } from 'react';
import { 
  View,
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity,
  LayoutAnimation,
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
  value: boolean;
  description?: string;
  onToggle: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ title, startIcon, value, description, onToggle }) => {
  const [showDescription, setShowDescription] = useState(false);

  const toggleDescription = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDescription(!showDescription);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View accessible={true} style={{ flexDirection: 'row', flex: 1 }}>
          <MaterialCommunityIcons
            name={startIcon}
            size={24}
            color={colors.secondary}
            style={styles.iconStart}
          />
          <Text
            accessibilityLabel={`${title} Setting`}
            style={styles.title}
          >
              {title}
          </Text>
        </View>
        
        <View style={styles.toggleContainer}>
          <Switch
            accessible={true}
            accessibilityRole='switch'
            accessibilityState={{ checked: value }}
            accessibilityHint={`Double tap to ${value ? 'disable' : 'enable'} ${title.replace(/^(Enable|Disable)\s+/i, '').toLowerCase()}`}
            value={value}
            onValueChange={onToggle}
            thumbColor={colors.bottomnav}
            trackColor={{ true: colors.secondary, false: colors.bottomnav }}
          />
        </View>
      </View>
      {description ? (
        <TouchableOpacity
          accessible={true}
          accessibilityRole='button'
          accessibilityLabel="Purpose of toggle"
          accessibilityState={{ expanded: showDescription }}
          accessibilityHint={`Double tap to ${showDescription ? 'collapse' : 'expand'} the description for this toggle button`}
          style={styles.infoBox} 
          onPress={toggleDescription}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={colors.accent}
            style={styles.iconStart}
          />
          <Text style={styles.infoText}>What is this?</Text>
        </TouchableOpacity>
      ) : null}
      {showDescription && description ? (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      ) : null}
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
  infoBox: {
    flexDirection: "row",
    paddingLeft: 15,
    paddingBottom: 15,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Radio Canada',
    color: colors.accent,
  },
  descriptionContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Radio Canada',
    color: colors.text,
  },
});

export default Toggle;