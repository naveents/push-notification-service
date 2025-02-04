// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'push-service',
            script: './dist/index.js',
        },
     /*   {
            name: 'kafka-consumer',
            script: './src/kafka/pushConsumer.ts',
            interpreter: 'node_modules/.bin/ts-node',
        },*/
        {
            name: 'kafka-consumer',
            script: './dist/kafka/pushConsumer.js', // Adjusted path to compiled JS
        },
    ],
};
