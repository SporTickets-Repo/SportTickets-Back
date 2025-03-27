import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async assignDashboardAccess(userId: string, eventId: string) {
    return this.dashboardRepository.addAccess(userId, eventId);
  }

  async assignListDashboardAccess(userId: string[], eventId: string) {
    return this.dashboardRepository.addListAccess(userId, eventId);
  }

  async revokeDashboardAccess(userId: string, eventId: string) {
    return this.dashboardRepository.removeAccess(userId, eventId);
  }

  async getUsersByEvent(eventId: string) {
    return this.dashboardRepository.findUsersByEvent(eventId);
  }

  async getEventsByUser(userId: string) {
    return this.dashboardRepository.findEventsByUser(userId);
  }
}
