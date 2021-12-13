import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns not found error if there are not such order', async () => {
    await request(app)
        .get(`/api/orders/${new mongoose.Types.ObjectId().toHexString()}`)
        .set('Cookie', signin())
        .send()
        .expect(404);
});

it('returns not found error if one user tries to fetch order of another user', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', signin())
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', signin())
        .send()
        .expect(404);
});

it('fetches the order', async () => {
    const cookie = signin();
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    const { body: returnedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(order).toEqual(returnedOrder);
});