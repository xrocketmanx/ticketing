import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedEvent, OrderStatus, Subjects } from '@amirov-tickets/common';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 200,
        userId: '12345'
    });
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: '12345',
        expiresAt: new Date().toISOString(),
        ticket: {
            id: ticket.id,
            price: 200
        }
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, message };
};

it('sets the orderId of the ticket', async () => {
    const { listener, ticket, data, message } = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toBe(data.id);
});

it('publishes ticket updated event', async () => {
    const { listener, ticket, data, message } = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(natsWrapper.client.publish).toHaveBeenCalledWith(
        Subjects.TicketUpdated,
        JSON.stringify({
            id: updatedTicket!.id,
            version: updatedTicket!.version,
            title: updatedTicket!.title,
            price: updatedTicket!.price,
            userId: updatedTicket!.userId,
            orderId: updatedTicket!.orderId
        }),
        expect.any(Function)
    );
});

it('acks the message', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});