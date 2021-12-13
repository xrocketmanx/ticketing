import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from '@amirov-tickets/common';
import { queueGroupName } from './que-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    readonly queGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], message: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        message.ack();
    }
}