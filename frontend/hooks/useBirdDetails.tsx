import { useState, useEffect } from 'react';
import { Bird } from '../../common/types/Bird';
import { fetchBirds } from '../helpers/APIUtils';

export default function useBirdDetails() {
    const [birds, setBirds] = useState<Bird[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBirds = async () => {
            try {
                const data = await fetchBirds();
                console.log('Fetched birds:', data); 
                setBirds(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
    
        loadBirds();
    }, []);    

    return { birds, loading };
}
