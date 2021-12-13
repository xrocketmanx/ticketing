import { Message, Stan } from 'node-nats-streaming';
import { AppEvent } from './app-event';

export abstract class Listener<T extends AppEvent> {
    abstract subject: T['subject'];
    abstract queGroupName: string;
    abstract onMessage(data: T['data'], message: Message): void;

    private client: Stan;
    protected ackWait: number = 5 * 1000;

    constructor(
        client: Stan
    ) {
        this.client = client;
    }

    subscriptionOptions() {
        return this.client.subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDurableName(this.queGroupName);
    }

    listen() {
        const subscription = this.client.subscribe(this.subject, this.queGroupName, this.subscriptionOptions());

        subscription.on('message', (message: Message) => {
            console.log(
                `Message received: ${this.subject} / ${this.queGroupName}`
            )

            const parsedData = this.parseMessage(message);
            this.onMessage(parsedData, message);
        });
    }

    parseMessage(message: Message) {
        const data = message.getData();

        return typeof data === 'string'
            ? JSON.parse(data)
            : JSON.parse(data.toString('utf8'))
    }
}
