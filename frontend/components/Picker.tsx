import React from "react";
import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import colors from "../assets/theme/colors";

interface PickerComponentProps {
  data: { label: string; value: string | number }[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  style?: object;
  icon?: React.ReactNode;
  placeholder?: string;
  showPlaceholder?: boolean;
}

const PickerComponent: React.FC<PickerComponentProps> = ({
  data,
  value,
  onChange,
  style,
  icon,
  placeholder = "Select an option",
  showPlaceholder = false,
}) => {
  return (
    <View style={styles.wrapper}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={[styles.pickerContainer, style]}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => onChange(itemValue)}
          accessibilityLabel="Dropdown for selecting a bird species"
          itemStyle={{ fontFamily:"Radio Canada", color: colors.text }}
        >
          {showPlaceholder && <Picker.Item label={placeholder} value={null} />}
          {data.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default PickerComponent;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  pickerContainer: {
    flex: 1,
    height: "auto",
    backgroundColor: colors.card,
    borderRadius: 30,
    borderColor: `${colors.primary}80`,
    borderWidth: 2,
    justifyContent: 'center',
  },
});
