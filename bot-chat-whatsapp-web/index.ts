import { qrCode, startBot } from "./src/bot";
import express, { Request, Response } from "express";
import fs from 'fs/promises';
import { deleteFolder, realtimeSupabase } from './src/funcoes';
import cors from 'cors';

// const app = express();

// app.use(express.json());
// app.use(cors({ origin: "*" }));

// app.get('/', (req: Request, res: Response) => {
//     res.status(200).json("Servidor bot!");
// });

// app.get('/getQRCode', (req: Request, res: Response) => {
//     if (qrCode) {
//         res.status(200).json({ qrCode: qrCode, message: 'QrCode disponivel!' });
//     }
// });

// app.delete('/reset', async (req: Request, res: Response) => {
//     deleteFolder('.wwebjs_auth');
//     process.exit(0);
// });

// app.listen(3002, () => {
//     console.log("servidor rodando em: http://localhost:3002");
// });

startBot();