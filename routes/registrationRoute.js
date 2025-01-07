import express from "express";
import { userRegistration } from "../controllers/registrationController.js";

const registrationRoute = express.Router();

// Define the registration route
registrationRoute.post("/registration", userRegistration);

export default registrationRoute;
