import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { envVariablesManager } from '@amirov-tickets/common';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCanceledListener } from './events/listeners/order-canceled-listener';

const start = async () => {
    envVariablesManager.validateVariables(['JWT_KEY', 'MONGO_URI', 'NATS_CLIENT_ID', 'NATS_URL', 'NATS_CLUSTER_ID']);

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
        new OrderCanceledListener(natsWrapper.client).listen();

        await mongoose.connect(envVariablesManager.get('MONGO_URI'));
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Tickets service listening on port 3000!!!');
    });
};

start();
