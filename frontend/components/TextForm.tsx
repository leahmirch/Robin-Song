import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps, TouchableOpacity, TextStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../assets/theme/colors';

interface TextFormFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  textStyle?: TextStyle;
}

const TextFormField: React.FC<TextFormFieldProps> = ({
  label,
  error,
  isPassword = false,
  style,
  textStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prevState => !prevState);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isFocused ? styles.focusedInput : null,
            error ? styles.errorBorder : null,
            textStyle,
          ]}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color={colors.secondary}
              style={styles.eye}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'Radio Canada',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    backgroundColor: colors.form,
  },
  input: {
    height: 40,
    flex: 1,
    paddingHorizontal: 10,
    color: colors.primary,
    fontFamily: 'Radio Canada',
  },
  focusedInput: {
    borderWidth: 0,
  },
  errorBorder: {
    borderColor: colors.primary,
  },
  icon: {
    marginRight: 10,
  },
  eye: {
    color: colors.primary,
  },
  errorText: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 5,
  },
});

export default TextFormField;
