import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, ConnectionStates } from "mongoose";

@Injectable()
export class MongoClient {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getConnection(): Connection {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection.readyState === ConnectionStates.connected;
  }
}
