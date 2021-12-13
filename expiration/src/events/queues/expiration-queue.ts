import Queue, { Job } from 'bull';
import { envVariablesManager } from '@amirov-tickets/common';
import { ExpirationCompletePublisher } from '../publishers/expiration-complete-publisher';
import { natsWrapper } from '../../nats-wrapper';

interface Payload {
    orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: envVariablesManager.get('REDIS_HOST')
    }
});

expirationQueue.process(async (job: Job<Payload>) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({ orderId: job.data.orderId });
});

export { expirationQueue };