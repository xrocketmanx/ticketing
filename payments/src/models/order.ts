import mongoose from 'mongoose';
import { OrderStatus } from '@amirov-tickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
    id: string;
    version: number;
    status: OrderStatus;
    price: number;
    userId: string;
}

type OrderDoc = mongoose.Document & OrderAttrs;

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
    findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Order.findOne({ _id: event.id, version: event.version - 1 });
};

orderSchema.statics.build = (attrs: OrderAttrs): OrderDoc => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        status: attrs.status,
        userId: attrs.userId,
        price: attrs.price
    });
};

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);