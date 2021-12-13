import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@amirov-tickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 when purchasing an order that does not exist', async () => {
    return request(app)
        .post('/api/payments')
        .set('Cookie', signin())
        .send({
            token: 'asdvc',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 200,
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0
    });
    await order.save();

    return request(app)
        .post('/api/payments')
        .set('Cookie', signin())
        .send({
            token: 'asdvc',
            orderId: order.id
        })
        .expect(401);
});

it('returns a 400 when purchasing a canceled order', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 200,
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Canceled,
        version: 0
    });
    await order.save();

    return request(app)
        .post('/api/payments')
        .set('Cookie', signin(order.userId))
        .send({
            token: 'asdvc',
            orderId: order.id
        })
        .expect(400);
});

it('returns a 204 with valid inputs', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 200,
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', signin(order.userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    expect(stripe.charges.create).toHaveBeenCalledWith({
        currency: 'usd',
        amount: order.price * 100,
        source: 'tok_visa'
    });

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: 'charge_id'
    });
    expect(payment).not.toBe(null);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
