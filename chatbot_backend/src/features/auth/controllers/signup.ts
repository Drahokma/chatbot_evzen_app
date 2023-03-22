import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { UserCache } from '../../../shared/services/redis/user.cache';
import { joiValidation } from '../../../shared/global/decorators/joi-validation.decorator';
import { signupSchema } from '../schemes/signup';
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface';
import { authService } from '../../../shared/services/db/auth.service';
import { BadRequestError } from '../../../shared/global/helpers/error-handler';
import { Helpers } from '../../../shared/global/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '../../../shared/global/helpers/cloudinary-upload';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { omit } from 'lodash';
import { AuthQueue} from '../../../shared/services/queues/auth.queue';
import { UserQueue } from '../../../shared/services/queues/user.queue';
import { config } from '../../../config';

const userCache: UserCache = new UserCache();
const authQueue: AuthQueue = new AuthQueue();
const userQueue: UserQueue = new UserQueue();

//const userCache: UserCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUserNameOrEmail(username, email);
    if (checkIfUserExist){
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });
    console.log(authObjectId, 'authObjectId');

    // const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    // if (!result?.public_id) {
    //   throw new BadRequestError('File upload. Error occured.Try again');
    // }

    //add to Redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    //add to MongoDB
    authQueue.addAuthUserJob('addAuthUserToDB', {value: authData });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache});

    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: userJwt, };
    res.status(HTTP_STATUS.CREATED).json({ message: 'Use r created successfully.', user: userDataForCache, token: userJwt});
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor,
      },
      config.JWT_TOKEN!
    );
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor} = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private userData(data:IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor
    } as IUserDocument;
  }
}
