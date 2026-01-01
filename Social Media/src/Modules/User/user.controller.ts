import { Router } from "express";
import userService from "./user.services";
import { authentication } from "../../Middleware/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/Models/user.model";
import { validation } from "../../Middleware/validation.middleware";
import { logoutSchema } from "./user.validation";

const router: Router = Router();

router.get(
  "/profile",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  userService.getProfile
);

router.post(
  "/logout",
  authentication(
    TokenTypeEnum.ACCESS,
    [RoleEnum.USER],
  ),
  validation(logoutSchema),
  userService.logout
);

export default router;
