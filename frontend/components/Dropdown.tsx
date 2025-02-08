import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import colors from '../assets/theme/colors';

interface DropdownProps {
  data: { label: string; value: string | number }[];
  value: string | number | null;
  onChange: (item: { label: string; value: string | number }) => void;
  placeholder?: string;
  maxHeight?: number;
}

const DropdownComponent: React.FC<DropdownProps> = ({
  data,
  value,
  onChange,
  placeholder = 'Select a species',
  maxHeight = 300,
}) => {
  const renderItem = (item: { label: string; value: string | number }) => (
    <View style={styles.item}>
      <Text style={styles.textItem}>{item.label}</Text>
    </View>
  );

  return (
    <Dropdown
      style={styles.dropdown}
      containerStyle={styles.container}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      iconStyle={styles.iconStyle}
      iconColor={colors.text}
      activeColor={colors.chatGPTCardBackground}
      data={data}
      maxHeight={maxHeight}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      renderItem={renderItem}
    />
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    margin: 12,
    width: '100%',
    height: 35,
    backgroundColor: colors.card,
    borderRadius: 30,
    borderColor: `${colors.primary}80`,
    borderWidth: 2,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  container: {
    borderRadius: 5,
    backgroundColor: colors.bottomnav,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Radio Canada',
  },
  iconStyle: {
    width: 24,
    height: 24,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: 'Radio Canada',
  },
  selectedTextStyle: {
    fontSize: 18,
    fontFamily: 'Radio Canada',
    fontWeight: 500,
    color: colors.text,
    textAlign: 'center',
  },
});
