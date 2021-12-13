import express, { Request, Response } from 'express';
import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest
} from '@amirov-tickets/common';
import { Ticket } from '../models/ticket';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
    '/api/tickets/:id',
    requireAuth,
    [
        body('title')
            .notEmpty()
            .withMessage('Title is required'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const currentUser = req.currentUser!;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.userId !== currentUser.id) {
            throw new NotAuthorizedError();
        }

        if (ticket.orderId !== undefined) {
            throw new BadRequestError('Ticker is already reserved');
        }

        const { title, price } = req.body;
        ticket.set({
            title,
            price
        });
        await ticket.save();

        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        });

        res.send(ticket);
    }
);

export { router as updateTicketRouter };