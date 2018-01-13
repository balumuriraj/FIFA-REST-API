import { Document, Model, Schema } from "mongoose";
import { mongoose } from "../../config/database";

export interface ILeague extends Document {
  remoteId: number;
  name: string;
  imageUrl: string;
  nation: string;
  clubsIds: [string];
}

// To remove deprecation error
mongoose.Promise = global.Promise;

const leagueSchema = new Schema({
  clubsIds: [String],
  imageUrl: String,
  name: String,
  nation: String,
  remoteId: Number
});

const League = mongoose.model<ILeague>("League", leagueSchema, "Leagues");

export class LeagueModel {
  private _leagueModel = League;

  constructor() {}

  static create(props?: any): Promise<string> {
    const model = new League(props);

    return new Promise<string>((resolve, reject) => {
      model.save((err: any, result: ILeague) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static update(id: string, update: any): Promise<ILeague> {
    return new Promise<ILeague>((resolve, reject) => {
      League.findByIdAndUpdate(id, update, (err: any, result: ILeague) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static find(query: any = {}): Promise<ILeague[]> {
    return new Promise<ILeague[]>((resolve, reject) => {
      League.find(query, (err: any, result: ILeague[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: string): Promise<ILeague> {
    return new Promise<ILeague>((resolve, reject) => {
      League.findById(id, (err: any, result: ILeague) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(LeagueModel);
