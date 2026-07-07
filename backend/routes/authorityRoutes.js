import express from "express";
import { getAuthorities } from "../controllers/authorityController.js";

const authorityRouter = express.Router();

// This sets up the inner GET route
authorityRouter.get("/", getAuthorities);

export default authorityRouter;
