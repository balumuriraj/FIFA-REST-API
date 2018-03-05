import { Document, Model, Schema } from "mongoose";
import { mongoose } from "../../config/database";

interface IRating {
  overall: number;
  attack: number;
  midfield: number;
  defence: number;
}

const Rating = {
  attack: Number,
  defence: Number,
  midfield: Number,
  overall: Number
};

interface IKit {
  home: string;
  away: string;
  alternate: string;
}

const Kit = {
  home: String,
  away: String,
  alternate: String
};

interface IStadium {
  name: string;
  latitude: string;
  longitude: string;
}

const Stadium = {
  name: String,
  latitude: String,
  longitude: String
};

export interface IClub extends Document {
  remoteId: number;
  abbrName: string;
  name: string;
  imageUrl: string;
  imageData: string;
  leagueId: string;
  kit: IKit;
  stadium: IStadium;
  rating: IRating;
  playerIds: [string];
}

// To remove deprecation error
mongoose.Promise = global.Promise;

const clubSchema = new Schema({
  remoteId: Number,
  abbrName: String,
  name: String,
  imageUrl: String,
  imageData: String,
  leagueId: String,
  kit: Kit,
  stadium: Stadium,
  rating: Rating,
  playerIds: [String]
});

const Club = mongoose.model<IClub>("Club", clubSchema, "Clubs");

export class ClubModel {
  private _clubModel = Club;

  constructor() {}

  static create(props?: any): Promise<string> {
    const model = new Club(props);

    return new Promise<string>((resolve, reject) => {
      model.save((err: any, result: IClub) => {
        if (err) {
          reject(err);
        }

        resolve(result._id);
      });
    });
  }

  static find(query: any = {}): Promise<IClub[]> {
    return new Promise<IClub[]>((resolve, reject) => {
      Club.find(query, (err: any, result: IClub[]) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static findById(id: string): Promise<IClub> {
    return new Promise<IClub>((resolve, reject) => {
      Club.findById(id, (err: any, result: IClub) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }

  static update(id: string, update: any): Promise<IClub> {
    return new Promise<IClub>((resolve, reject) => {
      Club.findByIdAndUpdate(id, update, (err: any, result: IClub) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}

Object.seal(ClubModel);
