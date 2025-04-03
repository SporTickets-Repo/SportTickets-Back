import { Prisma } from '@prisma/client';

export type EventWithRelations = Prisma.EventGetPayload<{
  include: {
    ticketTypes: {
      include: {
        ticketLots: true;
        categories: true;
        personalizedFields: true;
      };
    };
    bracket: true;
    address: true;
    ranking: true;
  };
}>;
