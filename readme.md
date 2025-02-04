Push Notification Service

Overview

Push Notification Service is a backend system for sending push notifications to iOS, Android, and Huawei devices. It supports sending notifications via HTTPS and through a Kafka consumer for high-throughput messaging.

Features

Supports push notifications for iOS, Android, and Huawei devices.

HTTPS and Kafka-based push notification delivery.

Built using Node.js 20, MongoDB, and Kafka.

Developed with TypeScript for strict type checking and maintainability.

Tech Stack

Language: TypeScript (Node.js 20)

Database: MongoDB

Messaging Queue: Kafka

Push Notification Protocols: HTTPS & Kafka Consumer

Installation

# Clone the repository
git clone https://github.com/naveents/push-notification-service.git
cd push-notification-service

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Update .env file with your configuration

# Start the service
npm start

Usage

Sending a Notification via API

Send a push notification using the HTTPS API:

POST /send-push
Content-Type: application/json
{
  "deviceToken": "<device_token>",
  "message": "Hello, this is a test notification!",
  "platform": "ios"  # or "android", "huawei"
}

Kafka Consumer

The service can also listen for messages from Kafka to send push notifications asynchronously.

Contributing

Fork the repository

Create a new feature branch

Commit your changes

Push to the branch and create a Pull Request

License

MIT License

Developed with ❤️ using Node.js & TypeScript.