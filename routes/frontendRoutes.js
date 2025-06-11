import express from "express";
import { BookACall, Subscribe } from "../controllers/frontendController.js";


const router = express.Router();

router.post("/book-call", BookACall);
router.post("/subscribe", Subscribe);


export default router;
