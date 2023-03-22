import { BaseQueue} from './base.queue';
import { userWorker } from '../../../shared/workers/user.worker';



export class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDB', 5 , userWorker.addUserToDb);
  }

  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}
