import mongoose from 'mongoose';
import { app } from './app';
import { envVariablesManager } from '@amirov-tickets/common';

const start = async () => {
    envVariablesManager.validateVariables(['JWT_KEY', 'MONGO_URI']);

    try {
        await mongoose.connect(envVariablesManager.get('MONGO_URI'));
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Auth service listening on port 3000!');
    });
};

start();
