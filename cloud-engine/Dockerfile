FROM node:22-alpine

WORKDIR /app

# Copy shared package
COPY shared/package.json shared/
COPY shared/dist/ shared/dist/

# Copy cloud-engine
COPY cloud-engine/package.json cloud-engine/
COPY package.json .

# Install production dependencies
RUN npm install --workspace=cloud-engine --omit=dev

# Copy built source
COPY cloud-engine/dist/ cloud-engine/dist/

# Create sessions directory
RUN mkdir -p cloud-engine/sessions

EXPOSE 3000

CMD ["node", "cloud-engine/dist/index.js"]
