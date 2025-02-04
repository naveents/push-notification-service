import { Kafka, Consumer } from 'kafkajs';
import { SendPushService } from '../api/services/sendPushService';

const TOPIC_NAME = 'push-notification';

const kafka = new Kafka({
    clientId: 'push-notification',
    brokers: [process.env.KAFKA_BROKERS as string], // Ensure process.env.KAFKA_BROKERS is of type string
});

// Consumer group ID to keep track of the progress of the consumers in a group
const consumer = kafka.consumer({ groupId: 'push-notification-group' });

async function consumePushMessages() {
    console.log('Waiting for push messages');
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (message?.value) {
                console.log('Initialize push service');

                const KafkaMessage = JSON.parse(message.value.toString());
                console.log('Message from kafka broker ', message.value.toString());
                const sendPush = new SendPushService(JSON.parse(KafkaMessage.body));
                await sendPush.processPush();

                await consumer.commitOffsets([{ topic, partition, offset: message.offset + 1 }]);

            } else {
                console.error('Received message with null value.');
            }
        },
    });
}

consumePushMessages();
