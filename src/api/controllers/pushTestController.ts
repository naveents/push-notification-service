import { Request, Response } from 'express';
import { Kafka, Partitioners } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'push-notification-service',
    brokers: [process.env.KAFKA_BROKERS as string],
});

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

export class PushTestController {
    static async testKafkaProduce(req: Request, res: Response) {

        const pushRequest = req.body;

        await producer.connect();
        try {
            // Send the push request as a message to the Kafka topic
            await producer.send({
                topic: 'push-notification',
                messages: [
                    { value: JSON.stringify(pushRequest) },
                ],
            });
           // Respond to the HTTP request indicating success
            res.status(200).json({ status: true, message: 'Push request sent to Kafka successfully' });
        } catch (error) {
            console.error('Failed to send push request to Kafka', error);
            res.status(500).json({ status: false, message: 'Failed to send push request to Kafka' });
        } finally {
            console.log('Finally block executed')
        }
    }
}
