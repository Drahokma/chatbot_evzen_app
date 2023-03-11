import express, { Express } from 'express';  
import { ChatbotServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';

class Application{
    public initialize():void{ 
        this.loadConfig();
        databaseConnection();
        const app: Express = express();
        const server: ChatbotServer = new ChatbotServer(app);
        server.start();
    }

    private loadConfig(): void{
        config.validateConfig();
    }
}

const application: Application = new Application();
application.initialize();
