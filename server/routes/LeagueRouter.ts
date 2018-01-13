import { NextFunction, Request, Response, Router } from "express";
import { ILeague, LeagueModel } from "../models/models";

function getLeagueResult(league: ILeague) {
  return {
    id: league._id,
    name: league.name,
    imageUrl: league.imageUrl,
    nation: league.nation,
    clubIds: league.clubsIds
  };
}

export class LeagueRouter {
  private router: Router = Router();

  /**
   * Initialize the HeroRouter
   */
  constructor() {
    this.router.get("/", this.getAll);
    this.router.get("/:id", this.getLeagueById);
  }

  public getRouter() {
    return this.router;
  }

  /**
   * GET all Leagues.
   */
  public async getAll(req: Request, res: Response, next: NextFunction) {
    const leagues = await LeagueModel.find();
    const result = leagues.map((league) => getLeagueResult(league));
    res.json(result);
  }

  public async getLeagueById(req: Request, res: Response, next: NextFunction) {
    const league = await LeagueModel.findById(req.params.id);
    res.json(getLeagueResult(league));
  }
}

// Create the ClubRouter, and export its configured Express.Router
const leagueRoutes = new LeagueRouter();

export default leagueRoutes.getRouter();
