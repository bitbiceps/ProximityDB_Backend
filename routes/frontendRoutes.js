import express from "express";
import { BookACall } from "../controllers/frontendController.js";


const router = express.Router();

router.post("/book-call", BookACall);


export default router;
