import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title,
            price
        });
};

it('can fetch a list of tickets', async () => {
    await createTicket('Titcket 1', 20);
    await createTicket('Titcket 2', 30);
    await createTicket('Titcket 3', 40);

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toBe(3);
});