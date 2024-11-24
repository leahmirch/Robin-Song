//import { registerRootComponent } from 'expo';
//import TabNavigator from './frontend/app/TabNavigator';

//registerRootComponent(TabNavigator);

import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView } from 'react-native';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <Text>Robin</Text>
       </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3E1D6',
        alignItems: 'center',
        justifyContent: 'center',
    }
})