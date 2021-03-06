import { NextFunction, Request, Response, Router } from "express";
import fs = require("fs");
import { JSDOM } from "jsdom";
import { Model } from "mongoose";
import path = require("path");
import request = require("request");
import { ClubModel, IPlayer, LeagueModel, PlayerModel } from "../models/models";

const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, "../../server/assets/jsons/metadata.json"), "utf8"));
const defPositions: string[] = ["LWB", "LB", "CB", "RB", "RWB"];
const midPositions: string[] = ["LM", "CAM", "CDM", "CM", "RM"];
const attPositions: string[] = ["LW", "LF", "CF", "RF", "RW", "ST"];

function performScrapeRequest(id: number) {
  const endpoint = "https://www.fifaindex.com/teams/?league=";
  const url = endpoint + id;
  console.log(url);
  return new Promise((resolve) => {
    JSDOM.fromURL(url).then((dom) => {
      const { document } = dom.window;
      resolve(document);
    });
  });
}

async function createClubsFromScrapeData(clubsMetadata: any, leagueId: string, remoteLeagueId: number) {
  const dom: any = await performScrapeRequest(remoteLeagueId);
  const div = dom.getElementById("no-more-tables");
  const table = div.getElementsByTagName("table")[0];
  const body = div.getElementsByTagName("tbody")[0];
  const rows = body.children;

  for (const row of rows) {
    const clubData = {
      name: null,
      leagueId,
      imageUrl: null,
      remoteId: null,
      rating: {
        attack: null,
        midfield: null,
        defence: null,
        overall: null
      }
    };
    const cells = row.children;

    for (const cell of cells) {
      const attributeValue = cell.getAttribute("data-title");

      if (attributeValue) {
        if (attributeValue === "Name") {
          clubData.name = cell.firstChild.text;
        }
        else if (attributeValue === "ATT") {
          clubData.rating.attack = cell.firstChild.textContent;
        }
        else if (attributeValue === "MID") {
          clubData.rating.midfield = cell.firstChild.textContent;
        }
        else if (attributeValue === "DEF") {
          clubData.rating.defence = cell.firstChild.textContent;
        }
        else if (attributeValue === "OVR") {
          clubData.rating.overall = cell.firstChild.textContent;
        }
      }
      else {
        const anchor = cell.firstChild;
        const href = anchor.href;
        const id = href && href.split("/")[4];

        clubData.remoteId = id && Number(id);

        const imageUrl = anchor.firstChild.src;
        clubData.imageUrl = imageUrl && imageUrl.replace("/50/", "/256/");
      }
    }

    const clubMetadata = clubsMetadata.find((data) => data.remoteId === clubData.remoteId);
    const imageData = await requestImageData(clubData.imageUrl);

    const clubId = await ClubModel.create({
      remoteId: clubData.remoteId,
      name: (clubMetadata && clubMetadata.name) || clubData.name,
      abbrName: clubData.name,
      imageUrl: clubData.imageUrl,
      imageData,
      leagueId,
      kit: clubMetadata && clubMetadata.kit,
      stadium: clubMetadata && clubMetadata.stadium,
      rating: clubData.rating,
      playerIds: []
    });
    console.log("clubId: ", clubId);

    // update league
    LeagueModel.update(leagueId, { $push: { clubsIds: clubId } });
  }
}

function requestImageData(url: string) {
  return new Promise((resolve) => {
    const imageRequest = request.defaults({ encoding: null });

    imageRequest.get(url, (error: any, response: any, body: any) => {
      if (error) {
        throw error;
      }

      if (response.statusCode === 200) {
        const data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString("base64");
        resolve(data);
      }
    });
  });
}

function performRequest(params: object) {
  const endpoint = "https://www.easports.com/fifa/ultimate-team/api/fut/item";
  const url = endpoint + "?jsonParamObject=" + JSON.stringify(params);
  console.log(url);
  return new Promise((resolve) => {
    request.get(url, (error: any, response: any, body: any) => {
      if (error) {
        throw error;
      }

      resolve(JSON.parse(body));
    });
  });
}

async function creatClubs(players: any[], leagueId: string, clubsMetadata: any[]) {
  for (const playerData of players) {
    if (playerData.baseId === Number(playerData.id)) {
      const clubData = playerData.club;
      const findResult = await ClubModel.find({ remoteId: clubData.id });

      let clubId: string = null;

      if (!findResult.length) {
        const clubMetadata = clubsMetadata.find((data) => data.name === clubData.name);

        clubId = await ClubModel.create({
          remoteId: clubData.id,
          abbrName: clubData.abbrName,
          name: clubData.name,
          imageUrl: clubData.imageUrls.normal.large,
          leagueId,
          kit: clubMetadata && clubMetadata.kit,
          stadium: clubMetadata && clubMetadata.stadium,
          rating: null,
          playerIds: []
        });
        console.log("clubId: ", clubId);

        // update league
        LeagueModel.update(leagueId, { $push: { clubsIds: clubId } });
      }
      else {
        clubId = findResult[0]._id;
      }

      await creatPlayer(playerData, clubId);
    }
  }

  // generate ratings for clubs
  const clubs = await ClubModel.find({});

  for (const club of clubs) {
    const clubPlayerIds = club.playerIds;
    const ratings: any = {};

    for (const id of clubPlayerIds) {
      const player = await PlayerModel.findById(id);

      const { position, rating } = player;
      const positionRating = ratings[position];

      if (positionRating) {
        ratings[position].push(rating);
      }
      else {
        ratings[position] = [rating];
      }
    }

    const gkRatings: number[] = [];
    const defRatings: number[] = [];
    const midRatings: number[] = [];
    const attRatings: number[] = [];

    for (const position in ratings) {
      const rating = ratings[position];
      const avgRating = Math.round(rating.reduce((p, c) => p + c, 0) / rating.length);
      const positionRating = rating.filter((value) => value >= avgRating);
      positionRating.sort().reverse().splice(2);

      if (position === "GK") {
        Array.prototype.push.apply(gkRatings, positionRating);
      }
      else if (defPositions.indexOf(position) > -1) {
        Array.prototype.push.apply(defRatings, positionRating);
      }
      else if (midPositions.indexOf(position) > -1) {
        Array.prototype.push.apply(midRatings, positionRating);
      }
      else if (attPositions.indexOf(position) > -1) {
        Array.prototype.push.apply(attRatings, positionRating);
      }
    }

    gkRatings.sort().reverse().splice(1);
    defRatings.sort().reverse().splice(6);
    midRatings.sort().reverse().splice(6);
    attRatings.sort().reverse().splice(4);

    console.log(gkRatings, defRatings, midRatings, attRatings);

    Array.prototype.push.apply(defRatings, gkRatings);

    const defence = Math.round(defRatings.reduce((p, c) => p + c, 0) / defRatings.length);
    const midfield = Math.round(midRatings.reduce((p, c) => p + c, 0) / midRatings.length);
    const attack = Math.round(attRatings.reduce((p, c) => p + c, 0) / attRatings.length);
    const overall = Math.round((defence + midfield + attack) / 3);

    const clubRating = { defence, midfield, attack, overall };

    await ClubModel.update(club._id, { rating: clubRating });
  }
}

async function creatPlayer(playerData: any, clubId: string) {
  const findResult = await PlayerModel.find({ remoteId: playerData.baseId });

  let playerId: string = null;

  if (!findResult.length) {
    playerId = await PlayerModel.create({
      remoteId: playerData.id,
      name: playerData.name,
      imageUrl: playerData.headshotImgUrl,
      clubId,
      position: playerData.position,
      age: playerData.age,
      rating: playerData.rating
    });
    console.log("playerId: ", playerId);

    // update club
    ClubModel.update(clubId, { $push: { playerIds: playerId } });
  }
  else {
    playerId = findResult[0]._id;
  }
}

export class AdminRouter {
  private router: Router = Router();

  /**
   * Initialize the HeroRouter
   */
  constructor() {
    this.router.post("/service", this.createDatabaseFromService);
    this.router.post("/scrape", this.createDatabaseFromScrape);
  }

  public getRouter() {
    return this.router;
  }

  public async createDatabaseFromService(req: Request, res: Response) {
    const leaguesMetadata = metadata.leagues;
    const clubsMetadata = metadata.clubs;

    for (const leagueMetadata of leaguesMetadata) {
      const remoteId = leagueMetadata.remoteId;
      const leagueId = await LeagueModel.create({
        name: leagueMetadata.name,
        imageUrl: leagueMetadata.imageUrl,
        remoteId: leagueMetadata.remoteId,
        nation: leagueMetadata.nation,
        clubsIds: []
      });
      console.log("leagueId: ", leagueId);

      const data: any = await performRequest({ league: remoteId });
      const pages = data.totalPages;
      const players: any[] = [];
      Array.prototype.push.apply(players, data.items);

      for (let i = 2; i <= pages; i++) {
        const pageData: any = await performRequest({ league: remoteId, page: i });
        Array.prototype.push.apply(players, pageData.items);
      }

      await creatClubs(players, leagueId, clubsMetadata);
    }
  }

  public async createDatabaseFromScrape() {
    const leaguesMetadata = metadata.leagues;
    const clubsMetadata = metadata.clubs;

    for (const leagueMetadata of leaguesMetadata) {
      const remoteId = leagueMetadata.remoteId;
      const leagueId = await LeagueModel.create({
        name: leagueMetadata.name,
        imageUrl: leagueMetadata.imageUrl,
        remoteId: leagueMetadata.remoteId,
        nation: leagueMetadata.nation,
        clubsIds: []
      });
      console.log("leagueId: ", leagueId);

      await createClubsFromScrapeData(clubsMetadata, leagueId, remoteId);
    }

  }
}

// Create the ClubRouter, and export its configured Express.Router
const adminRoutes = new AdminRouter();

export default adminRoutes.getRouter();
