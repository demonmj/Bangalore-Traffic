FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Forcing production npm variables strictly denying dev-dependencies
RUN npm install --production
COPY . .
ENV NODE_ENV=production
# Hardcode proxy targets to isolate network leaks
EXPOSE 5000
CMD ["node", "server.js"]
