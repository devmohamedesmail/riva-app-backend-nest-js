import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log('A user connected:', client.id);

    client.emit(
      'messageFromServer',
      'Hello! You are connected.',
    );
  }

  handleJoinStore(
    client: Socket,
    storeId: string | number,
  ) {
    client.join(`store_${storeId}`);

    console.log(
      `Socket ${client.id} joined room store_${storeId}`,
    );
  }

  handleDisconnect(client: Socket) {
    console.log('Disconnected:', client.id);
  }
}