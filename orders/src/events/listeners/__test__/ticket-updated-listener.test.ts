import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@amirov-tickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });
    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'cool concert',
        price: 30,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, message };
};

it('finds, updates and saves a ticket', async () => {
    const { listener, ticket, data, message } = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toBe('cool concert');
    expect(updatedTicket!.price).toBe(30);
    expect(updatedTicket!.version).toBe(1);
});

it('acks the message', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version', async () => {
    const { listener, data, message } = await setup();
    data.version = 10;

    try {
        await listener.onMessage(data, message);
    } catch (error) {}

    expect(message.ack).not.toHaveBeenCalled();
});