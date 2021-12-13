import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404);
});

it('returns the ticket if it is found', async () => {
    const title = 'Title';
    const price = 100;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title, price })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toBe(title);
    expect(ticketResponse.body.price).toBe(price);
});