import { Router } from "express";
import { getFullUserDetails, handleUserProfilePrimaryQuestionaire, handleUserProfileSecondaryQuestionaire, updateUserProfileData } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/details", getFullUserDetails);
userRouter.post("/update", updateUserProfileData);
userRouter.post("/primary-questionaire", handleUserProfilePrimaryQuestionaire);
userRouter.post("/secondary-questionaire", handleUserProfileSecondaryQuestionaire);

export default userRouter;
