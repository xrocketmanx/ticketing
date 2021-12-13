import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@amirov-tickets/common';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: '12345',
        expiresAt: new Date().toISOString(),
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 200
        }
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    return { listener, data, message };
};

it('creates order', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(200);
    expect(order!.userId).toEqual('12345');
});

it('acks the message', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});