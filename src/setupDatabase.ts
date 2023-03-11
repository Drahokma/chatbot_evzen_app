import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from './config';

const log: Logger = config.createLogger('setupDatabase');

const db_options = {
    family: 4
};

export default () => {
    const connect = () => {
        mongoose.connect(`${config.MOGNODB_URL}`, db_options)
            .then(() => {
                log.info('Successfully connected to database');
            })
            .catch((error) => {
                log.error('Error connecting to databse', error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};
