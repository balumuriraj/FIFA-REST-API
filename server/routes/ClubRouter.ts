import { NextFunction, Request, Response, Router } from "express";
import request = require("request");

export class ClubRouter {
  private router: Router = Router();

  /**
   * Initialize the HeroRouter
   */
  constructor() {
    this.router.get("/", this.getAll);
    // this.router.get("/:id", this.getOne);
  }

  public getRouter() {
    return this.router;
  }

  /**
   * GET all Clubs.
   */
  public async getAll(req: Request, res: Response, next: NextFunction) {
    // const clubs = await Club.find({}).exec();
    // res.json(data);
  }
}

// Create the ClubRouter, and export its configured Express.Router
const clubRoutes = new ClubRouter();

export default clubRoutes.getRouter();
