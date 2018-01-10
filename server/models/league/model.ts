import { Document, Model, Schema } from "mongoose";
import { mongoose } from "../../config/database";

export interface ILeague extends Document {
  remoteId: number;
  name: string;
  imageUrl: string;
  clubs: [string];
}

// To remove deprecation error
mongoose.Promise = global.Promise;

const leagueSchema = new Schema({
  clubs: [String],
  imageUrl: String,
  name: String,
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
}

Object.seal(LeagueModel);
