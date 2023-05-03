import express, { Express } from 'express';
import { createServer, Server } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

const app: Express = express();
const server: Server = createServer(app);
const io: SocketIOServer = new SocketIOServer(server);
const redis = require('redis');
const client = redis.createClient({
    host: lunaAmazonRedisHost, // Redis 서버의 주소 (기본값: 127.0.0.1)
    port: 6379, // Redis 서버의 포트 (기본값: 6379)
    password: "", // Redis 서버의 비밀번호 (설정한 경우)
    legacyMode: true
  });

const PORT: number = Number(process.env.PORT) || 3000;

client.on('error', (err: any) => {
  console.error('Redis 에러:', err);
});

app.use(express.static('public'));

io.on('connection', (socket: Socket) => {
  console.log('새로운 사용자가 접속했습니다.');
  
  client.incr('visitor_count', (err: any, count: BigInt) => {
    if (err) {
      console.error('Redis 에러:', err);
      return;
    }

    io.emit('visitor count', count);

    socket.on('disconnect', () => {
      console.log('사용자가 접속을 종료했습니다.');
      client.decr('visitor_count', (err: String, count: BigInt) => {
        if (err) {
          console.error('Redis 에러:', err);
          return;
        }
        io.emit('visitor count', count);
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
