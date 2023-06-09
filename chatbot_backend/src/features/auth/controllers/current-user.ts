import { Request, Response } from 'express';
import {IUserDocument} from '../../user/interfaces/user.interface';
import {UserCache} from '../../../shared/services/redis/user.cache';
import {userService} from '../../../shared/services/db/user.service';
import HTTP_STATUS from "http-status-codes";

const userCache = new UserCache();

export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;
    //first I check the cache and then the database
    const cachedUser: IUserDocument = await userCache.getUserFromCache(req.currentUser!.userId) as IUserDocument;
    const existingUser = cachedUser ? cachedUser : await userService.getUserById(req.currentUser!.userId);

    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }
    res.status(HTTP_STATUS.OK).json({isUser, token, user});
  }
}
