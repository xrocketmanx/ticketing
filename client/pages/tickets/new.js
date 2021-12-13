import { useState } from 'react';
import { useRequest } from '../../hooks/useRequest';
import Router from 'next/router';

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');

    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: { title, price },
        onSuccess: () => Router.push('/')
    });

    const onBlur = () => {
        const value = parseFloat(price);

        if (isNaN(value)) {
            return;
        }

        setPrice(value.toFixed(2));
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        await doRequest();
    };

    return (
        <div>
            <h1>Create a ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group mb-2">
                    <label>Title</label>
                    <input className="form-control" value={title} onChange={event => setTitle(event.target.value)}/>
                </div>
                <div className="form-group mb-2">
                    <label>Price</label>
                    <input
                        className="form-control"
                        value={price}
                        onChange={event => setPrice(event.target.value)}
                        onBlur={onBlur}
                    />
                </div>
                {errors}
                <button className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};

export default NewTicket;
