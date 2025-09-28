import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { MessageController } from '../controllers/messageController';

const messageRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(MessageController);

  router.post('/', controller.createMessage);
  router.get('/', controller.getMessages);
  router.get('/:id', controller.getMessageById);
  router.delete('/:id', controller.deleteMessageById);

  return router;
};

export const MESSAGE_ROUTER_SYMBOL = Symbol('messageRouterFactory');

export { messageRouterFactory };
