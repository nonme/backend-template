import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class TaskDocument extends Document {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ default: false, type: Boolean })
  completed: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(TaskDocument);
