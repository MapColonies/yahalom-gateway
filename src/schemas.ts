import { z } from 'zod';
import { SeverityLevels, LogComponent, AnalyticsMessageTypes } from './common/interfaces';

export const messageSchema = z.object({
  sessionId: z.string().optional(),
  severity: z.enum(SeverityLevels).optional(),
  component: z.enum(LogComponent).optional(),
  messageType: z.enum(AnalyticsMessageTypes).optional(),
  message: z.string().optional(),
  timeStamp: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid ISO date string',
    })
    .optional(),
});

export const idSchema = z.string().uuid();
