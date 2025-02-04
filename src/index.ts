//https://github.com/saisilinus/node-express-mongoose-typescript-boilerplate/blob/master/package.json
//boilerplate for reference
//https://www.youtube.com/watch?v=oNoRw69ro2k

import express, { Request, Response } from 'express';
import {pushRouter} from "./routes/pushRoutes";
import dotenv from 'dotenv';
import {connectToPushDb, connection } from "./database/db";
import bodyParser from "body-parser";
dotenv.config();

connectToPushDb();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use('/api/v1', pushRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Push Notification Service');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});