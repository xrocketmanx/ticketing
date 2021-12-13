import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { NotFoundError } from '@amirov-tickets/common';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        throw new NotFoundError();
    }

    res.send(ticket);
});


export { router as showTicketRouter };
