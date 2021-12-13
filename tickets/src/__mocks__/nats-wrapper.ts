export const natsWrapper = {
    connect: jest.fn(),
    client: {
        publish: jest.fn().mockImplementation((subject: string, message: string, callback: () => void) => callback())
    }
};
