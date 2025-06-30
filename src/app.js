import express from 'express';
import { configDotenv } from 'dotenv';

const app = express();
const port = process.env.PORT;
app.use(express.json());


app.use("/", router)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})