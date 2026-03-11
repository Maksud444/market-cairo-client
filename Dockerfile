FROM node:18-alpine
WORKDIR /app

# Accept build-time environment variables (baked into browser bundle)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG INTERNAL_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Install ALL dependencies (including devDependencies like tailwindcss)
COPY package*.json ./
RUN npm ci

COPY . .

# Build the app
RUN npm run build

# Set production env AFTER build
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "start"]
