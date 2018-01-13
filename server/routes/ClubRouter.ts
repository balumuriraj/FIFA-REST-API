import { NextFunction, Request, Response, Router } from "express";
import request = require("request");
import { ClubModel, IClub, IPlayer, LeagueModel, PlayerModel } from "../models/models";

async function generateData(clubOrClubs: IClub | IClub[]) {
  if (!Array.isArray(clubOrClubs)) {
    const club: IClub = clubOrClubs;
    return await generateClubData(club);
  }

  const result: any[] = [];
  const clubs: IClub[] = clubOrClubs;

  for (const club of clubs) {
    const resultClub = await generateClubData(club);
    result.push(resultClub);
  }

  return result;
}

async function generateClubData(club: IClub) {
  const leagueData = await generateLeagueData(club);
  const playersData = await generatePlayersData(club.playerIds);

  return {
    id: club._id,
    abbrName: club.abbrName,
    name: club.name,
    imageUrl: club.imageUrl,
    kit: club.kit,
    stadium: club.stadium,
    rating: club.rating,
    league: leagueData,
    players: playersData
  };
}

async function generateLeagueData(club: IClub) {
  const league = await LeagueModel.findById(club.leagueId);
  return {
    id: league._id,
    name: league.name,
    imageUrl: league.imageUrl,
    nation: league.nation
  };
}

async function generatePlayersData(playerIds: string[]) {
  const players: any[] = [];

  for (const playerId of playerIds) {
    const player = await PlayerModel.findById(playerId);
    players.push({
      id: player._id,
      name: player.name,
      imageUrl: player.imageUrl,
      position: player.position,
      age: player.age,
      rating: player.rating
    });
  }

  return players;
}

export class ClubRouter {
  private router: Router = Router();

  /**
   * Initialize the HeroRouter
   */
  constructor() {
    this.router.get("/", this.getAll);
    this.router.get("/:id", this.getClubById);
    this.router.get("/league/:id", this.getClubsByLeague);
  }

  public getRouter() {
    return this.router;
  }

  /**
   * GET all Clubs.
   */
  public async getAll(req: Request, res: Response, next: NextFunction) {
    const clubs = await ClubModel.find();
    const result = await generateData(clubs);
    res.json(result);
  }

  public async getClubById(req: Request, res: Response, next: NextFunction) {
    const club = await ClubModel.findById(req.params.id);
    const result = await generateData(club);
    res.json(result);
  }

  public async getClubsByLeague(req: Request, res: Response, next: NextFunction) {
    const clubs = await ClubModel.find({ leagueId: req.params.id });
    const result = await generateData(clubs);
    res.json(result);
  }
}

// Create the ClubRouter, and export its configured Express.Router
const clubRoutes = new ClubRouter();

export default clubRoutes.getRouter();
