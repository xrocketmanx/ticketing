import { OrderCanceledEvent, Publisher, Subjects } from '@amirov-tickets/common';

export class OrderCanceledPublisher extends Publisher<OrderCanceledEvent> {
    readonly subject = Subjects.OrderCanceled;
}