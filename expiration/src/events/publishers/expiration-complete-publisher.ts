import { ExpirationCompleteEvent, Publisher, Subjects } from '@amirov-tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}