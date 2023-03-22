import { BaseQueue} from './base.queue';
import {IAuthJob} from '../../../features/auth/interfaces/auth.interface';
import { authWorker } from '../../../shared/workers/auth.worker';



export class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDB', 5 , authWorker.addAuthUserToDb);
  }

  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}
