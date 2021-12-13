import { Message } from 'node-nats-streaming';
import { Listener } from './listener';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-event';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queGroupName = 'payments-service';

    onMessage(data: TicketCreatedEvent['data'], message: Message) {
        message.ack();
    }
}