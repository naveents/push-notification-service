import { Request, Response } from 'express';
import { SendPushService } from "../services/sendPushService";
import { PushLoggerService } from "../services/pushLoggerService";

export class PushNotificationController {
    static async processPushRequests(req: Request, res: Response) {
        const pushRequest = req.body;
        const sendPush = new SendPushService(pushRequest);
        await sendPush.processPush();
        res.status(200).json({ status: true, message: 'Push requests processed successfully' });
    }

    static async getPushLogs(req: Request, res: Response) {
        try {
            const data = await PushLoggerService.getPushLogs(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ status: false, message: 'Error fetching push logs' });
        }

    }
}
