import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { OrderCanceledEvent, Subjects } from '@amirov-tickets/common';
import mongoose from 'mongoose';
import { OrderCanceledListener } from '../order-canceled-listener';

const setup = async () => {
    const listener = new OrderCanceledListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 200,
        userId: '12345'
    });
    ticket.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket.save();

    const data: OrderCanceledEvent['data'] = {
        id: ticket.orderId!,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, message };
};

it('clears orderId from ticket', async () => {
    const { listener, ticket, data, message } = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toBeUndefined();
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