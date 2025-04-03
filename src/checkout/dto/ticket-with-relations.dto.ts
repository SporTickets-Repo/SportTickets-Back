import {
  AddressEvent,
  Category,
  Coupon,
  Event,
  PersonalizedField,
  PersonalizedFieldAnswer,
  Team,
  Ticket,
  TicketLot,
  TicketType,
  User,
} from '@prisma/client';

export type TicketWithRelations = Ticket & {
  user: User;
  ticketLot: TicketLot & {
    ticketType: TicketType & {
      event: Event & {
        address: AddressEvent;
      };
      personalizedFields: PersonalizedField[];
    };
  };
  category: Category;
  team?: Team & { tickets: (Ticket & { user: User })[] };
  coupon?: Coupon;
  personalizedFieldAnswers: (PersonalizedFieldAnswer & {
    personalizedField: PersonalizedField;
  })[];
};
