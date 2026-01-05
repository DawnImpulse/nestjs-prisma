FROM node:20-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "start:dev"]

FROM node:20-alpine As build

WORKDIR /usr/src/app

COPY package*.json ./

COPY --from=development /usr/src/app/node_modules ./node_modules

COPY . .

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine As production

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]
