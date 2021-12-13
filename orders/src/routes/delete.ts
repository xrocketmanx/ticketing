import express, { Request, Response } from 'express';
import { NotFoundError, OrderStatus, requireAuth } from '@amirov-tickets/common';
import { Order } from '../models/order';
import { OrderCanceledPublisher } from '../events/publishers/order-canceled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate('ticket');
        if (!order || order.userId !== req.currentUser!.id) {
            throw new NotFoundError();
        }

        order.status = OrderStatus.Canceled;
        await order.save();

        await new OrderCanceledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        res.sendStatus(204);
    }
);

export { router as deleteOrderRouter };