import mongoose from "mongoose";
import { model, Schema, Model, Document } from 'mongoose';

interface IDevice extends Document{
    deviceToken: string;
    deviceType: 'ios' | 'android';
}

interface IUser extends Document{
    userUuid: string | null;
    userType: 'guest' | 'admin';
    userName: string | null;
}

export interface IPushLog extends Document {
    title: string;
    body: string;
    imageLink: string | null;
    device: IDevice;
    user: IUser;
    messageType: 'normal-push' | 'chat-push';
    pushApi: 'apn' | 'fcm' | 'hcm';
    customParams: Array<any>;
    pushStatus: boolean;
    created: Date;
    error?: string;
}


const Device: Schema = new Schema({
    deviceToken: {type: String, required: true},
    deviceType: { type: String, enum: ['ios', 'android']},
});

const User: Schema = new Schema({
    userUuid: { type: String,  default: null  },
    userType: { type: String,  enum: ['guest', 'manager']},
    userName: { type: String, default: null },
});

const PushLogSchema: Schema = new Schema({
    title: { type: String, required: true },
    body: { type: String,  required: true  },
    imageLink: { type: String,  default: null  },
    device: Device,
    user: User,
    hotelUuid: { type: String,  default: null  },
    messageType: { type: String, enum: ['normal-push', 'chat-push'] },
    pushApi: { type: String, enum: ['apn', 'fcm', 'hcm'] },
    customParams: { type: Array,  default: [] as Array<any> },
    pushStatus: { type: Boolean, default: false},
    created: { type: Date, required: true,  default: new Date() },
    error: { type: Schema.Types.Mixed, required: false, default:null}
});

//const PushLog = mongoose.model<IPushLog>('PushSendLog', PushLogSchema);

export { PushLogSchema};

