class Bird {
    static async getAll() {
        return [
            { id: 1, name: 'Sparrow', imageUrl: 'https://example.com/sparrow.jpg' },
            { id: 2, name: 'Robin', imageUrl: 'https://example.com/robin.jpg' },
        ];
    }

    static async getLatest() {
        return { id: 2, name: 'Robin', imageUrl: 'https://example.com/robin.jpg' };
    }

    static async save(data) {
        return { success: true, data };
    }
}

export default Bird;
