import { Listener, OrderCanceledEvent, OrderStatus, Subjects } from '@amirov-tickets/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
    readonly subject = Subjects.OrderCanceled;
    readonly queGroupName = queueGroupName;

    async onMessage(data: OrderCanceledEvent['data'], message: Message) {
        const order = await Order.findByEvent(data);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Canceled });
        await order.save();

        message.ack();
    }
}