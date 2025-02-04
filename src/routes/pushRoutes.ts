import { Router, Request, Response } from 'express';
const router = Router();
import {PushNotificationController} from "../api/controllers/pushNotificationController";
import { PushTestController } from "../api/controllers/pushTestController";

router.post('/send-push-notification', PushNotificationController.processPushRequests);
router.get('/push-logs', PushNotificationController.getPushLogs);
export {router as pushRouter};