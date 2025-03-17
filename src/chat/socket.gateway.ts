import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { senderId: string; receiverId: string }) {
    const roomId = [data.senderId, data.receiverId].sort().join('_');
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { senderId: string; receiverId: string; text: string },
  ) {
    console.log('Message received:', data);

    const roomId = [data.senderId, data.receiverId].sort().join('_');
    this.server.to(roomId).emit('receiveMessage', {
      senderId: data.senderId,
      receiverId: data.receiverId,
      text: data.text,
    });
  }
}