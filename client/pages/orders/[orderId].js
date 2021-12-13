import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { useRequest } from '../../hooks/useRequest';
import Router from 'next/router';

const OrderShow = ({ currentUser, order }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };

        const interval = setInterval(findTimeLeft, 1000);
        findTimeLeft();

        return () => clearInterval(interval);
    }, []);

    if (timeLeft < 0) {
        return (
            <div>Order expired</div>
        );
    }

    return (
        <div>
            <h1>Purchasing: "{order.ticket.title}"</h1>
            Time left to pay: {timeLeft} seconds
            <br />
            <StripeCheckout
                token={({ id }) => doRequest({ token: id })}
                stripeKey="pk_test_51K57YGLRjyktrCQqrbZOlAPDyt6dIv54xYvkY1byzHzy6KbTpI7ahW3nb8T3pbRbwYpiljfBtaR4ALsZe0azH7HG00qJvdAic3"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;

    const { data } = await client.get(`/api/orders/${orderId}`);

    return {
        order: data
    };
};

export default OrderShow;