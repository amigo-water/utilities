// src/services/event-handler.service.ts
import { consumer } from '../config/kafka';

export class EventHandlerService {
  private static instance: EventHandlerService;
  private initialized = false;

  private constructor() {}

  static getInstance(): EventHandlerService {
    if (!EventHandlerService.instance) {
      EventHandlerService.instance = new EventHandlerService();
    }
    return EventHandlerService.instance;
  }

  async init() {
    if (this.initialized) return;
    
    await consumer.connect();
    this.initialized = true;
  }

 /*  async subscribeToEvents() {
    // Subscribe to user events
    await this.subscribeToUserEvents();
    await this.subscribeToRoleEvents();
  }

  private async subscribeToUserEvents() {
    // Subscribe to user created events
    await consumer.subscribe({ topic: 'user.created' });
    
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '');
          await this.handleUserCreated(data);
        } catch (error) {
          console.error('Error processing user.created event:', error);
        }
      }
    });
  }

  private async subscribeToRoleEvents() {
    // Subscribe to role events
    await consumer.subscribe({ topic: 'role.created' });
    await consumer.subscribe({ topic: 'role.updated' });
    await consumer.subscribe({ topic: 'role.deleted' });
    
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '');
          const eventType = data.eventType;
          
          switch (eventType) {
            case 'role.created':
              await this.handleRoleCreated(data);
              break;
            case 'role.updated':
              await this.handleRoleUpdated(data);
              break;
            case 'role.deleted':
              await this.handleRoleDeleted(data);
              break;
          }
        } catch (error) {
          console.error('Error processing role event:', error);
        }
      }
    });
  } */



    async subscribeToEvents() {
        await consumer.subscribe({ topic: 'user.created' });
        await consumer.subscribe({ topic: 'role.created' });
        await consumer.subscribe({ topic: 'role.updated' });
        await consumer.subscribe({ topic: 'role.deleted' });
      
        await consumer.run({
          eachMessage: async ({ topic, message }) => {
            try {
              const data = JSON.parse(message.value?.toString() || '');
      
              switch (topic) {
                case 'user.created':
                  await this.handleUserCreated(data);
                  break;
                case 'role.created':
                  await this.handleRoleCreated(data);
                  break;
                case 'role.updated':
                  await this.handleRoleUpdated(data);
                  break;
                case 'role.deleted':
                  await this.handleRoleDeleted(data);
                  break;
                default:
                  console.warn(`No handler for topic: ${topic}`);
              }
      
            } catch (error) {
              console.error(`Error processing event on topic ${topic}:`, error);
            }
          }
        });
      }
      
  private async handleUserCreated(data: any) {
    // Handle user creation
    console.log('New user created:', data);
    await this.sendWelcomeEmail(data.email);
  }

  private async handleRoleCreated(data: any) {
    // Handle role creation
    console.log('New role assigned:', data);
    await this.notifyRoleAssignment(data.userId, data.role_name);
  }

  private async handleRoleUpdated(data: any) {
    // Handle role update
    console.log('Role updated:', data);
    await this.notifyRoleChange(data.userId, data.role_name);
  }

  private async handleRoleDeleted(data: any) {
    // Handle role deletion
    console.log('Role removed:', data);
    await this.notifyRoleRemoval(data.userId, data.role_name);
  }

  private async sendWelcomeEmail(email: string) {
    // Send welcome email logic
    console.log('Sending welcome email to:', email);
  }

  private async notifyRoleAssignment(userId: string, roleName: string) {
    // Notify about role assignment
    console.log('Notifying role assignment:', { userId, roleName });
  }

  private async notifyRoleChange(userId: string, roleName: string) {
    // Notify about role change
    console.log('Notifying role change:', { userId, roleName });
  }

  private async notifyRoleRemoval(userId: string, roleName: string) {
    // Notify about role removal
    console.log('Notifying role removal:', { userId, roleName });
  }
}