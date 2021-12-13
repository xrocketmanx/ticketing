import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { ExpirationCompleteEvent, OrderStatus } from '@amirov-tickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: '12345',
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    return { listener, order, data, message };
};

it('updates the order status to canceled', async () => {
    const { listener, data, order, message } = await setup();

    await listener.onMessage(data, message);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Canceled);
});


it('emit a order canceled event', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('ack a message', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});