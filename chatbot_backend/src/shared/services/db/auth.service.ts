import { IAuthDocument } from '../../../features/auth/interfaces/auth.interface';
import { AuthModel } from '../../../features/auth/models/auth.scheme';
import { Helpers } from '../../global/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }


  public async getUserByUserNameOrEmail(username: string, email: string): Promise<IAuthDocument>{
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username)}, {email: Helpers.lowerCase(email)}]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument>{
    const user: IAuthDocument = (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username)}).exec()) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
