import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRotuer from './routes/users.router.js';
import CharactersRouter from './routes/characters.router.js';
import ItemsRouter from './routes/items.router.js';
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js';
import LogMiddleware from './middlewares/log.middleware.js';

const app = express();
const PORT = 3306;

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('/api', [UsersRotuer, CharactersRouter, ItemsRouter]);
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
