import { Router } from "express";
import { getFullUserDetails, handleUserProfileQuestionaire, updateUserProfileData } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/details", getFullUserDetails);
userRouter.post("/update", updateUserProfileData);
userRouter.post("/profile-questionaire", handleUserProfileQuestionaire);

export default userRouter;
