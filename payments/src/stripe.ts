import Stripe from 'stripe';
import { envVariablesManager } from '@amirov-tickets/common';

export const stripe = new Stripe(
    envVariablesManager.get('STRIPE_KEY'),
    {
        apiVersion: '2020-08-27'
    }
);