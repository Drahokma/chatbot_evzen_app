import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from './config';
import { redisConnection } from './shared/services/redis/redis.connection';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
    const connect = () => {
        mongoose.connect(`${config.MONGODB_URL}`)
            .then(() => {
              log.info('Successfully connected to database');
              redisConnection.connect();
            })
            .catch((error) => {
              log.error('Error connecting to databse', error);
              return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};
