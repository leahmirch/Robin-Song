import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function BirdCard({ name, imageUrl }: { name: string; imageUrl: string }) {
    return (
        <View style={styles.card}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <Text style={styles.text}>{name}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    text: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
