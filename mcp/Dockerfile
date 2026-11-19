# Build from the repository root:  docker build -f mcp/Dockerfile -t marble-skill-taxonomy-mcp .
FROM node:22-slim
WORKDIR /app
COPY mcp/package.json mcp/package-lock.json ./mcp/
RUN cd mcp && npm ci --omit=dev
COPY data/manifest.json data/topics.json data/dependencies.json data/curriculum-standards.json data/curriculum-alignments.json data/teaching-research.json ./data/
COPY mcp/server.mjs ./mcp/
COPY mcp/lib ./mcp/lib
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
EXPOSE 8080
USER node
CMD ["node", "mcp/server.mjs", "--http"]
