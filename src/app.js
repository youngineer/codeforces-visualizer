import express from 'express';
import { configDotenv } from 'dotenv';
import {connectDb} from './config/database.js';
import router from './routers/router.js';
configDotenv();

const app = express();
const port = process.env.PORT;
app.use(express.json());


app.use("/", router)

app.listen(process.env.PORT);
    console.log("Server listening on port", process.env.PORT);

// connectDb()
//   .then(() => {
//     app.listen(process.env.PORT);
//     console.log("Server listening on port", process.env.PORT);
//   }).catch((err) => {
//     console.error(err);
//   })