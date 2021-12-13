import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { envVariablesManager } from '@amirov-tickets/common';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
    console.log('Starting...');

    envVariablesManager.validateVariables([
        'JWT_KEY',
        'MONGO_URI',
        'NATS_CLIENT_ID',
        'NATS_URL',
        'NATS_CLUSTER_ID',
        'EXPIRATION_WINDOW_SECONDS'
    ]);

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

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        await mongoose.connect(envVariablesManager.get('MONGO_URI'));
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Orders service listening on port 3000!');
    });
};

start();
