import { Router } from "express";
import {
  getFullUserDetails,
  handleUserProfilePrimaryQuestionaire,
  handleUserProfileSecondaryQuestionaire,
  updateUserProfileData,
  fetchUserMessageList
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/details", getFullUserDetails);
userRouter.post("/update", updateUserProfileData);
userRouter.post("/primary-questionaire", handleUserProfilePrimaryQuestionaire);
userRouter.post(
  "/secondary-questionaire",
  handleUserProfileSecondaryQuestionaire
);
userRouter.post(
  "/secondary-questionaire",
  handleUserProfileSecondaryQuestionaire
);
userRouter.get("/messageList/:userId", fetchUserMessageList);


export default userRouter;
