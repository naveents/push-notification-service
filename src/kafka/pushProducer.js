const { Kafka, Partitioners } = require('kafkajs');

const TOPIC_NAME = 'push-notification';

const kafka = new Kafka({
    clientId: 'push-notification',
    brokers: [ process.env.KAFKA_BROKERS ],
});

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

async function sendKafkaMessage(topic, message) {
    await producer.connect();
    await producer.send({
        topic: topic,
        messages: [{ value: JSON.stringify(message) }],
    });
    await producer.disconnect();
}

// Test push messages
const pushMessage = {
    "notification": {
        "title": "Greeting from team",
        "body": "Merry Christmas All",
        "attributes": {
            "customKey": "customValue"
        },
        "messageType": "normal-push",
        "recipients": [
            {
                "userUuid": "9e5a6dca-c098-4a7d-a802-6863a9eeb4f8",
            },
            {
                "userUuid": "9e5a6dca-c098-4a7d-a802-6863a9eeb4f8",
            }
        ]
    }
};

sendKafkaMessage(TOPIC_NAME, pushMessage);
