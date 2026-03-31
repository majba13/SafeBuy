import { Injectable } from '@nestjs/common';

@Injectable()
export class CourierService {
  async trackShipment(trackingNumber: string) {
    // Dummy courier tracking logic (integrate real APIs in production)
    return { status: 'in transit', trackingNumber };
  }
  async listProviders() {
    return [
      { name: 'DeliVro' },
      { name: 'Pathao Courier' },
      { name: 'Steadfast' },
      { name: 'Sundarban Courier' },
    ];
  }
}
