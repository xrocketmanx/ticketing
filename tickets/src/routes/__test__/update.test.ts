import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    return request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', signin())
        .send({ title: 'title', price: 10 })
        .expect(404);
});

it('returns 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    return request(app)
        .put(`/api/tickets/${id}`)
        .send({ title: 'title', price: 10 })
        .expect(401);
});

it('returns 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({ title: 'ticket', price: 20 });

    return request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', signin())
        .send({ title: 'my ticket', price: 30 })
        .expect(401);
});

it('rejects a ticket update if it is reserved', async () => {
    const authCookie = signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', authCookie)
        .send({ title: 'ticket', price: 20 });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    return request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', authCookie)
        .send({ title: 'new title', price: -30 })
        .expect(400);
});

it('returns 400 if the user provides an invalid title or price', async () => {
    const authCookie = signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', authCookie)
        .send({ title: 'ticket', price: 20 });

    return request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', authCookie)
        .send({ title: '', price: -30 })
        .expect(400);
});

it('updates the ticket', async () => {
    const authCookie = signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', authCookie)
        .send({ title: 'ticket', price: 20 });

    const updateTicketResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', authCookie)
        .send({ title: 'My ticket', price: 30 })
        .expect(200);

    expect(updateTicketResponse.body.title).toEqual('My ticket');
    expect(updateTicketResponse.body.price).toEqual(30);
});

it('publishes an event', async () => {
    const authCookie = signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', authCookie)
        .send({ title: 'ticket', price: 20 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', authCookie)
        .send({ title: 'My ticket', price: 30 })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});