import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  // -- Conversation grouping -----------------------------
  /** Deterministic: `${minId}_${maxId}` � same for both directions */
  @Prop({ required: true, index: true })
  roomId: string;

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversation: Types.ObjectId;

  // -- Participants --------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  // -- Product Context -----------------------------------
  /** Optional product that initiated the conversation */
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product: Types.ObjectId;

  // -- Content -------------------------------------------
  @Prop({
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text',
  })
  messageType: string;

  @Prop({ default: '', maxlength: 5000 })
  text: string;

  /** Cloudinary URL for images/files */
  @Prop({ default: '' })
  fileUrl: string;

  @Prop({ default: '' })
  fileName: string;

  @Prop({ default: 0 })
  fileSize: number;

  // -- Read Status ---------------------------------------
  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt: Date;

  // -- Soft Delete ---------------------------------------
  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// --- Indexes ------------------------------------------------------------------
MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ receiver: 1, isRead: 1 });
// TTL: delete messages older than 1 year
MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
