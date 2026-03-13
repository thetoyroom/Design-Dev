import mongoose, { Schema, Document } from 'mongoose';

export interface ITool extends Document {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  category_id: mongoose.Types.ObjectId;
  tags: string[]; // Or array of ObjectIds if we want strict tagging
  source?: string;
  created_at: Date;
}

const ToolSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  thumbnail: { type: String },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: String }],
  source: { type: String },
}, { timestamps: true });

export default mongoose.model<ITool>('Tool', ToolSchema);
