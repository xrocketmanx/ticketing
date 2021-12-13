import mongoose from 'mongoose';
import { OrderCanceledEvent, OrderStatus } from '@amirov-tickets/common';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCanceledListener } from '../order-canceled-listener';

const setup = async () => {
    const listener = new OrderCanceledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 200,
        userId: '1234',
        status: OrderStatus.Created
    });
    await order.save();

    const data: OrderCanceledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    };

    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    };

    return { listener, order, data, message };
};

it('throws an error when order version does not match', async () => {
    const { listener, data, message } = await setup();
    data.version = 4;

    try {
        await listener.onMessage(data, message);
    } catch (error) {
        return;
    }

    throw new Error('Failed to catch');
});

it('cancels order', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    const order = await Order.findById(data.id);

    expect(order!.status).toEqual(OrderStatus.Canceled);
});

it('acks the message', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});