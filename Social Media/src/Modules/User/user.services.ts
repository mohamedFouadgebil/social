import { Request, Response } from "express";
import { LogoutDTO } from "./user.dto";
import { createRevokeToken, LogoutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { UpdateQuery } from "mongoose";
import { IUser, UserModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";

class UserService {
  private _userModel = new UserRepository(UserModel);

  constructor() {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      message: "Done",
      data: { user: req.user, decoded: req.decoded },
    });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogoutDTO = req.body;
    let statusCode: number = 200;
    const update: UpdateQuery<IUser> = {};

    switch (flag) {
      case LogoutEnum.ONLY:
        await createRevokeToken(req.decoded as JwtPayload);
        statusCode = 201;
        break;
      case LogoutEnum.ALL:
        update.changeCredentialsTime = new Date();
        break;
      default:
        break;
    }

    await this._userModel.updateOne({
      filter: { _id: req.decoded?._id },
      update,
    });

    return res.status(statusCode).json({
      message: "Done",
    });
  };
}

export default new UserService();
