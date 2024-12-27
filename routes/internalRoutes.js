import { Router } from "express";
import { handleGetAllCount } from "../controllers/internalController.js";

const internalRouter = Router();

internalRouter.get("/all", handleGetAllCount);

export default internalRouter;
