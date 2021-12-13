import { Publisher, Subjects, TicketCreatedEvent } from '@amirov-tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}