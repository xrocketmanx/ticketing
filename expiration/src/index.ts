import { natsWrapper } from './nats-wrapper';
import { envVariablesManager } from '@amirov-tickets/common';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
    envVariablesManager.validateVariables(['NATS_CLIENT_ID', 'NATS_URL', 'NATS_CLUSTER_ID', 'REDIS_HOST']);

    try {
        await natsWrapper.connect(
            envVariablesManager.get('NATS_CLUSTER_ID'),
            envVariablesManager.get('NATS_CLIENT_ID'),
            envVariablesManager.get('NATS_URL')
        );
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.error(err);
    }

    console.log('Started up successfully');
};

start();
