import { Listener, Subjects, TicketUpdatedEvent } from '@amirov-tickets/common';
import { queueGroupName } from './que-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    readonly queGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], message: Message) {
        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        const { title, price } = data;
        ticket.set({ title, price });
        await ticket.save();

        message.ack();
    }
}