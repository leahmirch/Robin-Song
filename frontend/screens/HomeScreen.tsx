import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import BirdCard from '../components/BirdCard';
import useBirdDetails from '../hooks/useBirdDetails';
import Loader from '../components/Loader';
import { Bird } from '../../common/types/Bird';

export default function HomeScreen() {
    const { birds, loading } = useBirdDetails();

    if (loading) return <Loader />;

    if (birds.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No birds available. Check the backend or API.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={birds}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <BirdCard name={item.name} imageUrl={item.imageUrl} />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
});
