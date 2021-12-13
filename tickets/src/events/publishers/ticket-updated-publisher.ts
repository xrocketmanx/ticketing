import { Publisher, Subjects, TicketUpdatedEvent } from '@amirov-tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}