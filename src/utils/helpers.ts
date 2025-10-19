/* istanbul ignore file */
import { Message } from '@src/DAL/entities/message';
import { ILogObject } from './../../src/common/interfaces';

export const mapMessageToILogObject = (msg: Message): ILogObject => {
  return {
    id: msg.id,
    sessionId: msg.sessionId,
    severity: msg.severity,
    timeStamp: msg.timeStamp.toString(),
    message: msg.message,
    messageParameters: msg.messageParameters,
    component: msg.component,
    messageType: msg.messageType,
  };
};
