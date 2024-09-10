import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRotuer from './routes/users.router.js';

const app = express();
const PORT = 3306;

app.use(express.json());
app.use(cookieParser());

app.use('/api', [UsersRotuer]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});