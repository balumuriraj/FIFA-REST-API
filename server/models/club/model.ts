import { Document, Model, Schema } from "mongoose";
import { mongoose } from "../../config/database";

export interface IClub extends Document {
  name: string;
  country: string;
  league: string;
  attack: number;
  midfield: number;
  defence: number;
}

const schema = new Schema({
  attack: String,
  country: String,
  defence: String,
  league: String,
  midfield: String,
  name: Number,
});

export const Club = mongoose.model<IClub>("Club", schema);
