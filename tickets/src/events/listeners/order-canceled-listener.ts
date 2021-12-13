import { Listener, OrderCanceledEvent, Subjects } from '@amirov-tickets/common';
import { queueGroupName } from './queueGroupName';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCanceledListener extends Listener<OrderCanceledEvent> {
    readonly subject = Subjects.OrderCanceled;
    readonly queGroupName = queueGroupName;

    async onMessage(data: OrderCanceledEvent['data'], message: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({ orderId: undefined });
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        });

        message.ack();
    }
}