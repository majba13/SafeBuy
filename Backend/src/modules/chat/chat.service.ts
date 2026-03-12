import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  private getRoomId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  async saveMessage(
    senderId: string,
    receiverId: string,
    text: string,
    image?: string,
  ): Promise<Message> {
    const roomId = this.getRoomId(senderId, receiverId);
    return this.messageModel.create({
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      text,
      fileUrl: image || '',
      roomId,
    });
  }

  async getMessages(userId: string, otherUserId: string, page: number = 1) {
    const roomId = this.getRoomId(userId, otherUserId);
    const limit = 30;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ roomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar'),
      this.messageModel.countDocuments({ roomId }),
    ]);

    return {
      messages: messages.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    const roomId = this.getRoomId(senderId, receiverId);
    await this.messageModel.updateMany(
      { roomId, sender: new Types.ObjectId(senderId), isRead: false },
      { isRead: true },
    );
  }

  async getConversations(userId: string) {
    // Get last message for each conversation
    return this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { sender: new Types.ObjectId(userId) },
            { receiver: new Types.ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$lastMessage' } },
      {
        $lookup: {
          from: 'users',
          let: {
            otherId: {
              $cond: [
                { $eq: ['$sender', new Types.ObjectId(userId)] },
                '$receiver',
                '$sender',
              ],
            },
          },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$otherId'] } } },
            { $project: { name: 1, avatar: 1 } },
          ],
          as: 'otherUser',
        },
      },
      { $unwind: '$otherUser' },
      {
        $addFields: {
          unreadCount: {
            $cond: [{ $eq: ['$receiver', new Types.ObjectId(userId)] }, { $toInt: { $not: '$isRead' } }, 0],
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      receiver: new Types.ObjectId(userId),
      isRead: false,
    });
  }
}
