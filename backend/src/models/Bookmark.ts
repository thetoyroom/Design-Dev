import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  user_id: mongoose.Types.ObjectId;
  tool_id: mongoose.Types.ObjectId;
}

const BookmarkSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tool_id: { type: Schema.Types.ObjectId, ref: 'Tool', required: true },
}, { timestamps: true });

export default mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
