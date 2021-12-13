import { Listener, Subjects, TicketCreatedEvent } from '@amirov-tickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './que-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    readonly queGroupName = queueGroupName;

    async onMessage(data: TicketCreatedEvent['data'], message: Message) {
        const { id, title, price } = data;
        const ticket = Ticket.build({ id, title, price });

        await ticket.save();

        message.ack();
    }
}