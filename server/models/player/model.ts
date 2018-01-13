import { Document, Model, Schema } from "mongoose";
import { mongoose } from "../../config/database";
import { IPlayer } from "./model";

export interface IPlayer extends Document {
  remoteId: number;
  name: string;
  imageUrl: string;
  clubId: string;
  position: string;
  age: number;
  rating: number;
}

// To remove deprecation error
mongoose.Promise = global.Promise;

const playerSchema = new Schema({
  remoteId: Number,
  name: String,
  imageUrl: String,
  clubId: String,
  position: String,
  age: Number,
  rating: Number
});

const Player = mongoose.model<IPlayer>("Player", playerSchema, "Players");

export class PlayerModel {
  private _playerModel = Player;

  constructor() {}

  static create(props?: any): Promise<string> {
    const model = new Player(props);

    return new Promise<string>((resolve, reject) => {
      model.save((err: any, result: IPlayer) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static find(query: any = {}): Promise<IPlayer[]> {
    return new Promise<IPlayer[]>((resolve, reject) => {
      Player.find(query, (err: any, result: IPlayer[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: string): Promise<IPlayer> {
    return new Promise<IPlayer>((resolve, reject) => {
      Player.findById(id, (err: any, result: IPlayer) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(PlayerModel);
