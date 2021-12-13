import { PaymentCreatedEvent, Publisher, Subjects } from '@amirov-tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}