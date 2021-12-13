import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import mongoose from 'mongoose';

const createTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    return ticket;
};

it('returns orders of the user', async () => {
    const ticket1 = await createTicket();
    const ticket2 = await createTicket();
    const ticket3 = await createTicket();

    const userOne = signin();
    const userTwo = signin();

    const order1 = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket1.id })
        .expect(201);

    const order2 = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticket2.id })
        .expect(201);
    const order3 = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticket3.id })
        .expect(201);

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    expect(response.body).toEqual([order2.body, order3.body]);
});