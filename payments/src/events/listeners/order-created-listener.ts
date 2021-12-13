import { Listener, OrderCreatedEvent, Subjects } from '@amirov-tickets/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    readonly queGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], message: Message) {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });
        await order.save();

        message.ack();
    }
}