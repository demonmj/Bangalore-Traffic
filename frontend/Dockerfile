# Stage 1: Construct Vite Optimized Production Builds
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We use Vite production compiler emitting static outputs directly to /dist
RUN npm run build

# Stage 2: Emulate Secure NGINX Sub-process mapped strictly to Port 3000
FROM nginx:alpine
# Inject Custom Routing Block overriding generic outputs
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy transpiled JS, CSS, and HTML payloads directly into Linux file-system mappings
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
