FROM node:16

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./

RUN npm install
RUN npm install -g nodemon
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]
