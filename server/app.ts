import * as bodyParser from "body-parser";
import * as express from "express";
import * as http from "http";
import * as logger from "morgan";
import ClubRouter from "./routes/ClubRouter";

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  // Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(logger("dev"));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
  }

  // Configure API endpoints.
  private routes(): void {
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */
    const router = express.Router();
    // placeholder route handler
    router.get("/", (req, res, next) => {
      res.json({
        message: "Hello FIFA World!",
      });
    });

    this.express.use("/", router);
    this.express.use("/api/v1/clubs", ClubRouter);
  }

}

const app = new App().express;
app.set("port", process.env.PORT || 3000);
const server: http.Server = app.listen(app.get("port"), () => {
  logger("app listening on port 3000!");
});

export { server };
