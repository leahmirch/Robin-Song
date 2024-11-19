import { Bird } from '../../common/types/Bird';

export const fetchBirds = async (): Promise<Bird[]> => {
    const response = await fetch('http://localhost:3000/api/birds');
    if (!response.ok) throw new Error('Failed to fetch birds.');
    return response.json();
};

export const fetchLatestBird = async () => {
    const response = await fetch('http://localhost:3000/api/birds/latest');
    if (!response.ok) throw new Error('Failed to fetch latest bird.');
    return response.json();
};
