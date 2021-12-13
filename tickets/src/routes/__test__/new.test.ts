import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { Subjects } from '@amirov-tickets/common';

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.statusCode).not.toBe(404);
});

it('can only be accessed if the user is signed in', async () => {
    return request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it('can be accessed if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({});

    expect(response.statusCode).not.toBe(401);
});

it('returns an error if an invalid title is provided', async () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: '',
            price: 10
        })
        .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: 'Ticket',
            price: -10
        })
        .expect(400);
});

it('creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: 'Ticket',
            price: 100
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual('Ticket');
    expect(tickets[0].price).toEqual(100);
});

it('publishes an event', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', signin())
        .send({
            title: 'Ticket',
            price: 100
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});