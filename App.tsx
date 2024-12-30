import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { StyleSheet, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import colors from './frontend/assets/theme/colors';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './frontend/app/TabNavigator';
import LoginScreen from './frontend/screens/LoginScreen';
import { app } from './database/firebaseConfig';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';


//Firebase Auth Instance
const auth = getAuth(app);

export default function App() {
    const [loaded, error] = useFonts({
        'Caprasimo': require('./frontend/assets/fonts/Caprasimo.ttf'),
        'Radio Canada': require('./frontend/assets/fonts/RadioCanadaVariable.ttf'),
        'Radio Canada Italic': require('./frontend/assets/fonts/RadioCanadaItalic.ttf'),
    });

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser); // No more type error
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    if (isLoading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

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