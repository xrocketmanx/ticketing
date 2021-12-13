import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
    BadRequestError,
    envVariablesManager,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest
} from '@amirov-tickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
    '/api/orders',
    requireAuth,
    [
        body('ticketId')
            .notEmpty()
            .custom(input => mongoose.Types.ObjectId.isValid(input))
            .withMessage('TicketId must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        // Find the ticket the user is trying to order
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }

        // Make sure ticket is not already reserved
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }

        // Calculate an expiration date for this order
        const expiration = new Date();
        const expirationWindowSeconds = Number(envVariablesManager.get('EXPIRATION_WINDOW_SECONDS'));
        expiration.setSeconds(expiration.getSeconds() + expirationWindowSeconds);

        // Build the order and save
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });
        await order.save();

        await new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price
            }
        });

        // Publish an event about order creation
        res.status(201).send(order);
    }
);

export { router as newOrderRouter };