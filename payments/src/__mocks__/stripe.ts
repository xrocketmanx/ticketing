export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({ id: 'charge_id' })
    }
};