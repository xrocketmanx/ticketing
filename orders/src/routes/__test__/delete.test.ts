import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns not found error if there are not such order', async () => {
    await request(app)
        .delete(`/api/orders/${new mongoose.Types.ObjectId().toHexString()}`)
        .set('Cookie', signin())
        .send()
        .expect(404);
});

it('returns not found error if one user tries to cancel order of another user', async () => {
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
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', signin())
        .send()
        .expect(404);
});

it('cancels the order', async () => {
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

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204);
});

it('emits order canceled event', async () => {
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

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});