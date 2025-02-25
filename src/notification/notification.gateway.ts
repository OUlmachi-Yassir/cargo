import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({ cors: true })
  export class NotificationGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer() server: Server;
  
    private clients = new Map<string, Socket>();
  
    afterInit(server: Server) {
      console.log('WebSocket initialized');
    }
  
    handleConnection(client: Socket) {
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.clients.set(userId, client);
        console.log(`Client connecté : ${userId}`);
      }
    }
  
    handleDisconnect(client: Socket) {
      const userId = [...this.clients.entries()].find(
        ([, socket]) => socket.id === client.id,
      )?.[0];
      if (userId) {
        this.clients.delete(userId);
        console.log(`Client déconnecté : ${userId}`);
      }
    }
  
    sendNotification(userId: string, message: string) {
      const client = this.clients.get(userId);
      if (client) {
        client.emit('notification', { message });
      }
    }
  }
  