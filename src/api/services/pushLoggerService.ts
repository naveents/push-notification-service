import {connectToPushDb, PushLog} from "../../database/db";
import { Request } from 'express';

interface PushLogData {
    title: string;
    body: string;
    messageType: string;
    deviceToken: string;
    deviceType: string;
    userUuid: string;
    pushApi: string;
    attributes: {} | any[];
    pushStatus: boolean;
    error: string | null;
}

export class PushLoggerService {
    async logPushDetails(data: PushLogData): Promise<void> {

        await connectToPushDb();

        console.log('Writing data to mongodb');
        try {
            const pushLog = new PushLog({
                title: data.title,
                body: data.body,
                messageType: data.messageType,
                device: {
                    deviceToken: data.deviceToken,
                    deviceType: data.deviceType,             
                },
                user: {
                    userUuid: data.userUuid,
                },
                pushApi: data.pushApi,
                customParams: data.attributes,
                pushStatus: data.pushStatus,
                error: data.error,
                created: new Date(),
            });

            await pushLog.save()
                .then((savedLog) => {
                    console.log('Log saved successfully:', savedLog.pushStatus);
                })
                .catch((error) => {
                    console.error('Error saving log:', error);
                });
        }catch(err)
        {
            console.log(err);
        }
    }

    static async getPushLogs(req: Request): Promise<any> {
        await connectToPushDb();

        const { hotelUuid, user, pushStatus, messageType, deviceType } = req.query;

        const { page = 1, perPage = 100 } = req.query;

        const pageAsNumber: number = Number(page);
        const perPageAsNumber: number = Number(perPage);

        const skip: number = (pageAsNumber - 1) * perPageAsNumber;

        try {
            const query: any = {};

            if (pushStatus !== undefined) {
                query['pushStatus'] = pushStatus === 'true';
            }

            if (messageType !== undefined) {
                query['messageType'] = messageType;
            }

            if (deviceType !== undefined) {
                query['device.deviceType'] = deviceType;
            }

            if (user !== undefined) {
                query['$or'] = [
                    { 'user.userUuid': user },
                    {
                        '$or': [
                            // Exact match for username
                            { 'user.userName': user },
                            // Wildcard search for username anywhere
                            { 'user.userName': { $regex: new RegExp(`.*${user}.*`, 'i') } }
                        ]
                    }
                ];
            }


            // Get the total count for pagination
            const totalCount: number = await PushLog.countDocuments(query);

            // Calculate pagination details
            const totalPages: number = Math.ceil(totalCount / perPageAsNumber);

            const pushLogs =  await PushLog.find(query).skip(skip)
                .limit(Number(perPage))
                .sort({ created: 'desc' });

            return {
                    status: true,
                    logs: pushLogs,
                    pagination: {
                    currentPage: pageAsNumber,
                    totalPages,
                    totalRecords: totalCount,
                   }
            };

        } catch (error) {
            console.error('Error fetching push logs:', error);
            throw error;
        }
    }
}
