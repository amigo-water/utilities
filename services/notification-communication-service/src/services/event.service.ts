// import { Event, EventAttributes } from '../models/event.model';

// export class EventService {
//   /**
//    * Store a new event in the database
//    */
//   public static async storeEvent(eventData: Omit<EventAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
//     try {
//       const event = await Event.create({
//         ...eventData,
//         status: 'pending',
//       });
//       return event;
//     } catch (error) {
//       console.error('Error storing event:', error);
//       throw new Error('Failed to store event');
//     }
//   }

//   /**
//    * Update event status
//    */
//   public static async updateEventStatus(
//     eventId: number,
//     status: 'pending' | 'processed' | 'failed',
//     error?: string
//   ): Promise<[number, Event[]]> {
//     try {
//       const updateData: Partial<EventAttributes> = { status };
//       if (error) {
//         updateData.error = error;
//       }
//       return await Event.update(updateData, { where: { id: eventId } });
//     } catch (error) {
//       console.error('Error updating event status:', error);
//       throw new Error('Failed to update event status');
//     }
//   }

//   /**
//    * Get events with optional filtering
//    */
//   public static async getEvents(
//     filters: Partial<{
//       eventType: string;
//       serviceName: string;
//       status: 'pending' | 'processed' | 'failed';
//       startDate: Date;
//       endDate: Date;
//       limit: number;
//       offset: number;
//     }> = {}
//   ): Promise<{ rows: Event[]; count: number }> {
//     const {
//       eventType,
//       serviceName,
//       status,
//       startDate,
//       endDate,
//       limit = 100,
//       offset = 0,
//     } = filters;

//     const where: any = {};

//     if (eventType) where.eventType = eventType;
//     if (serviceName) where.serviceName = serviceName;
//     if (status) where.status = status;

//     if (startDate || endDate) {
//       where.createdAt = {};
//       if (startDate) where.createdAt[Op.gte] = startDate;
//       if (endDate) where.createdAt[Op.lte] = endDate;
//     }

//     try {
//       const result = await Event.findAndCountAll({
//         where,
//         limit,
//         offset,
//         order: [['createdAt', 'DESC']],
//       });

//       return {
//         rows: result.rows,
//         count: result.count,
//       };
//     } catch (error) {
//       console.error('Error fetching events:', error);
//       throw new Error('Failed to fetch events');
//     }
//   }
// }

// export default EventService;
