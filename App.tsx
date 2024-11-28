import React from 'react';
import { useFonts } from 'expo-font';
import { StyleSheet, Text, SafeAreaView } from 'react-native';
import colors from './frontend/assets/theme/colors';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './frontend/app/TabNavigator';

export default function App() {
    const [loaded, error] = useFonts({
        'Caprasimo': require('./frontend/assets/fonts/Caprasimo.ttf'),
        'Radio Canada': require('./frontend/assets/fonts/RadioCanadaVariable.ttf'),
        'Radio Canada Italic': require('./frontend/assets/fonts/RadioCanadaItalic.ttf'),
    });

    return (
        <NavigationContainer>
            <TabNavigator />
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'colors.background',
        alignItems: 'center',
        justifyContent: 'center',
    },
});