import { Request, Response } from 'express';
import { authService } from '../../../shared/services/db/auth.service';
import { config } from '../../../config';
import { IAuthDocument } from '../interfaces/auth.interface';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '../../../shared/global/decorators/joi-validation.decorator';
import { BadRequestError } from '../../../shared/global/helpers/error-handler';
import { loginSchema } from '../schemes/signin';
import { IUserDocument } from '../../../features/user/interfaces/user.interface';
import { userService } from '../../../shared/services/db/user.service';
import Logger from 'bunyan';

const log: Logger = config.createLogger('signIn');

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    console.log(existingUser!._id, 'existingUser._id');
    console.log(user._id, 'User._id');
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;
    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: userDocument, token: userJwt });
  }
}
