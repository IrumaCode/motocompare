// Node entry point: the only file that depends on Node's HTTP server.
import { createServer } from 'node:http';
import { createApp, createAppDependencies } from './app.js';
import { loadConfig } from './config.js';
import { createPrismaClient } from './db/prisma-client.js';

const config = loadConfig(process.env);
const prisma = createPrismaClient(config.databaseUrl);
const yoga = createApp(createAppDependencies(prisma), { corsOrigins: config.corsOrigins });
const server = createServer(yoga.requestListener);

server.listen(config.port, () => {
  console.info(
    `GraphQL API ready at http://localhost:${String(config.port)}${yoga.graphqlEndpoint}`,
  );
});

function shutdown(): void {
  server.close(() => {
    void prisma.$disconnect();
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
