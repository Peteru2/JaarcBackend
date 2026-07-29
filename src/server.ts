import type { Server } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './database/prisma';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    logger.info(
      `JAARC API listening on port ${env.PORT} [${env.NODE_ENV}]`
    );
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received. Shutting down gracefully.`);

    const forceExit = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExit.unref();

    server.close((error) => {
      void (async (): Promise<void> => {
        if (error) {
          logger.error({ err: error }, 'Error while closing HTTP server.');
        }
        await disconnectDatabase();
        clearTimeout(forceExit);
        process.exit(error ? 1 : 0);
      })();
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection.');
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception. Exiting immediately.');
    void disconnectDatabase().finally(() => process.exit(1));
  });
};

void bootstrap().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Failed to start the application.');
  process.exit(1);
});