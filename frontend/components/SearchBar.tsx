import React, { useState } from 'react';
import { 
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../assets/theme/colors';

interface SearchBarProps {
    label: string;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ label, search, setSearch, onSearch }) => {
    const handleSearch = () => {
        if (search.trim()) {
            onSearch(search);
            Keyboard.dismiss();
        }
    };

    return (
        <View 
          accessible={true}
          accessibilityLabel='Search field'
          accessibilityHint={`Double tap to ${label}`}
          style={styles.searchContainer}
        >
          <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
            <MaterialCommunityIcons
              name="magnify"
              size={25}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            selectionColor={colors.primary}
            placeholder={label}
            placeholderTextColor={colors.accent}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType='search'
          />
      </View>
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        fontFamily: 'Caprasimo',
        fontSize: 48,
        color: colors.secondary,
        textAlign: 'center',
        backgroundColor: colors.chatGPTCardBackground,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.accent,
        height: 40,
        paddingLeft: 4,
    },
    searchIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 30,
        backgroundColor: colors.accent,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 6,
    },
    searchInput: {
        fontFamily: "Radio Canada",
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        fontSize: 16,
        color: colors.accent,
        flex: 1,
    },
});

export default SearchBar;