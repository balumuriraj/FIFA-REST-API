import { NextFunction, Request, Response, Router } from "express";
import { Club } from "../models/club/model";

export class ClubRouter {
  private router: Router = Router();

  /**
   * Initialize the HeroRouter
   */
  constructor() {
    this.router.get("/", this.getAll);
    this.router.get("/:id", this.getOne);
  }

  public getRouter() {
    return this.router;
  }

  /**
   * GET all Heroes.
   */
  public async getAll(req: Request, res: Response, next: NextFunction) {
    const clubs = await Club.find({}).exec();
    res.json(clubs);
  }

  /**
   * GET one clubs by id
   */
  public async getOne(req: Request, res: Response, next: NextFunction) {
    const query = parseInt(req.params.id, 0);
    const club = Club.find((hero) => hero.id === query);
    if (club) {
      res.status(200)
        .send({
          club,
          message: "Success",
          status: res.status,
        });
    } else {
      res.status(404)
        .send({
          message: "No club found with the given id.",
          status: res.status,
        });
    }
  }
}

// Create the ClubRouter, and export its configured Express.Router
const clubRoutes = new ClubRouter();

export default clubRoutes.getRouter();
