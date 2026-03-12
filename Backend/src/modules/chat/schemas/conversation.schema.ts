import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

/**
 * A Conversation groups messages between two users (buyer <-> seller).
 * One conversation per unique (buyer, seller) pair.
 */
@Schema({ timestamps: true })
export class Conversation {
  // -- Participants --------------------------------------
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  seller: Types.ObjectId;

  /** Same deterministic roomId used by Message: `${minId}_${maxId}` */
  @Prop({ required: true, unique: true })
  roomId: string;

  // -- Product Context -----------------------------------
  /** Product that initiated the chat (optional) */
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product: Types.ObjectId;

  // -- Last Message Snapshot -----------------------------
  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;

  @Prop({ default: '' })
  lastMessageText: string;

  @Prop({ type: Date })
  lastMessageAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastMessageBy: Types.ObjectId;

  // -- Unread Counts -------------------------------------
  /** Number of unread messages for buyer */
  @Prop({ default: 0, min: 0 })
  buyerUnread: number;

  /** Number of unread messages for seller */
  @Prop({ default: 0, min: 0 })
  sellerUnread: number;

  // -- Status --------------------------------------------
  @Prop({ default: true })
  isActive: boolean;

  /** Either participant can archive */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  archivedBy: Types.ObjectId[];

  /** Either participant can mute */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  mutedBy: Types.ObjectId[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// --- Indexes ------------------------------------------------------------------
ConversationSchema.index({ roomId: 1 }, { unique: true });
ConversationSchema.index({ buyer: 1, lastMessageAt: -1 });
ConversationSchema.index({ seller: 1, lastMessageAt: -1 });
ConversationSchema.index({ buyer: 1, seller: 1 }, { unique: true });
ConversationSchema.index({ lastMessageAt: -1 });
