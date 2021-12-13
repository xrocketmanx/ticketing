import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from '@amirov-tickets/common';
import { queueGroupName } from './que-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCanceledPublisher } from '../publishers/order-canceled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    readonly queGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], message: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status === OrderStatus.Complete) {
            return message.ack();
        }

        order.set({ status: OrderStatus.Canceled });
        await order.save();

        await new OrderCanceledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        message.ack();
    }
}