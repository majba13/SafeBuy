import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

export type CourierProvider = 'pathao' | 'steadfast' | 'paperfly' | 'redx' | 'manual';

export interface ShipmentResult {
  trackingNumber: string;
  courier: string;
  estimatedDelivery?: Date;
  label?: string;
  consignmentId?: string;
}

export interface TrackingEvent {
  timestamp: Date;
  description: string;
  location?: string;
}

export interface TrackingResult {
  status: string;
  location?: string;
  events: TrackingEvent[];
  estimatedDelivery?: Date;
  courier?: string;
  trackingNumber?: string;
}

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private config: ConfigService,
  ) {}

  // â”€â”€â”€ Unified create-shipment entry point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async createShipment(
    orderId: string,
    courier: CourierProvider,
    options?: { trackingNumber?: string; estimatedDays?: number; sellerNote?: string },
  ): Promise<ShipmentResult> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('customer', 'name email')
      .lean();
    if (!order) throw new NotFoundException('Order not found');
    if (!['processing', 'confirmed', 'pending'].includes(order.status)) {
      throw new BadRequestException(`Cannot create shipment for order in status: ${order.status}`);
    }

    let result: ShipmentResult;
    switch (courier) {
      case 'pathao':
        result = await this.createPathaoShipment(order);
        break;
      case 'steadfast':
        result = await this.createSteadfastShipment(order);
        break;
      case 'paperfly':
        result = await this.createPaperflyShipment(order);
        break;
      case 'redx':
        result = await this.createRedxShipment(order);
        break;
      default:
        result = await this._createManualShipment(
          order,
          options?.trackingNumber ?? `MANUAL-${Date.now()}`,
          'manual',
          options?.estimatedDays ?? 5,
        );
    }

    // Persist to Order document
    await this.orderModel.findByIdAndUpdate(orderId, {
      $set: {
        'items.$[].trackingNumber': result.trackingNumber,
        'items.$[].courier': result.courier,
        'items.$[].shippedAt': new Date(),
        'items.$[].status': 'shipped',
        status: 'shipped',
        shippedAt: new Date(),
        estimatedDelivery: result.estimatedDelivery,
        ...(options?.sellerNote ? { notes: options.sellerNote } : {}),
      },
    });

    return result;
  }

  // â”€â”€â”€ Pathao Integration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private async pathaoAuth(): Promise<string> {
    const response = await fetch('https://hermes.pathao.com/api/v1/issue-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.config.get('PATHAO_CLIENT_ID'),
        client_secret: this.config.get('PATHAO_CLIENT_SECRET'),
        username: this.config.get('PATHAO_USERNAME'),
        password: this.config.get('PATHAO_PASSWORD'),
        grant_type: 'password',
      }),
    });
    const data: any = await response.json();
    if (!data.access_token) throw new Error('Pathao auth failed');
    return data.access_token;
  }

  private async createPathaoShipment(order: any): Promise<ShipmentResult> {
    try {
      const token = await this.pathaoAuth();
      const response = await fetch('https://hermes.pathao.com/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          store_id: this.config.get('PATHAO_STORE_ID'),
          merchant_order_id: order.orderNumber,
          recipient_name: order.shippingAddress?.fullName ?? order.shippingAddress?.name ?? 'Customer',
          recipient_phone: order.shippingAddress?.phone ?? '',
          recipient_address: `${order.shippingAddress?.street ?? order.shippingAddress?.address ?? ''}, ${order.shippingAddress?.city ?? ''}`,
          recipient_city: order.shippingAddress?.city ?? 'Dhaka',
          delivery_type: 48,
          item_type: 2,
          item_quantity: order.items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 1,
          amount_to_collect: order.paymentMethod === 'cod' ? (order.totalAmount ?? order.total ?? 0) : 0,
          item_weight: 0.5,
        }),
      });
      const data: any = await response.json();
      if (data.code !== 200) throw new BadRequestException(data.message ?? 'Pathao API error');

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      return { trackingNumber: data.data.consignment_id, courier: 'pathao', estimatedDelivery: deliveryDate, consignmentId: data.data.consignment_id };
    } catch (err: any) {
      this.logger.error(`Pathao shipment failed: ${err.message}`);
      throw new BadRequestException('Pathao shipment creation failed. Use manual tracking.');
    }
  }

  // â”€â”€â”€ Steadfast Integration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private async createSteadfastShipment(order: any): Promise<ShipmentResult> {
    try {
      const response = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': this.config.get('STEADFAST_API_KEY') ?? '',
          'Secret-Key': this.config.get('STEADFAST_API_SECRET') ?? '',
        },
        body: JSON.stringify({
          invoice: order.orderNumber,
          recipient_name: order.shippingAddress?.fullName ?? order.shippingAddress?.name ?? 'Customer',
          recipient_phone: order.shippingAddress?.phone ?? '',
          recipient_address: `${order.shippingAddress?.street ?? order.shippingAddress?.address ?? ''}, ${order.shippingAddress?.city ?? ''}`,
          cod_amount: order.paymentMethod === 'cod' ? (order.totalAmount ?? order.total ?? 0) : 0,
          note: `SafeBuy Order #${order.orderNumber}`,
        }),
      });
      const data: any = await response.json();
      if (data.status !== 200) throw new BadRequestException(data.message ?? 'Steadfast API error');

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 4);
      return { trackingNumber: data.tracking_code, courier: 'steadfast', estimatedDelivery: deliveryDate };
    } catch (err: any) {
      this.logger.error(`Steadfast shipment failed: ${err.message}`);
      throw new BadRequestException('Steadfast shipment creation failed. Use manual tracking.');
    }
  }

  // â”€â”€â”€ Paperfly Integration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private async createPaperflyShipment(order: any): Promise<ShipmentResult> {
    try {
      const response = await fetch('https://api.paperfly.com.bd/api/v1/parcel/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAP-API-KEY': this.config.get('PAPERFLY_API_KEY') ?? '',
          'X-PAP-TOKEN': this.config.get('PAPERFLY_TOKEN') ?? '',
        },
        body: JSON.stringify({
          merchant_order_id: order.orderNumber,
          recipient_name: order.shippingAddress?.fullName ?? 'Customer',
          recipient_phone: order.shippingAddress?.phone ?? '',
          recipient_address: order.shippingAddress?.street ?? '',
          recipient_city: order.shippingAddress?.city ?? 'Dhaka',
          cod_amount: order.paymentMethod === 'cod' ? (order.totalAmount ?? 0) : 0,
          parcel_weight: 500,
        }),
      });
      const data: any = await response.json();
      if (!data.success) throw new Error(data.message ?? 'Paperfly API error');

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 4);
      return { trackingNumber: data.data?.tracking_code ?? `PF-${Date.now()}`, courier: 'paperfly', estimatedDelivery: deliveryDate };
    } catch (err: any) {
      this.logger.error(`Paperfly shipment failed: ${err.message}`);
      throw new BadRequestException('Paperfly shipment creation failed. Use manual tracking.');
    }
  }

  // â”€â”€â”€ RedX Integration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private async createRedxShipment(order: any): Promise<ShipmentResult> {
    try {
      const response = await fetch('https://openapi.redx.com.bd/v1.0.0-beta/parcel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-ACCESS-TOKEN': `Bearer ${this.config.get('REDX_API_KEY') ?? ''}`,
        },
        body: JSON.stringify({
          name: order.shippingAddress?.fullName ?? 'Customer',
          phone: order.shippingAddress?.phone ?? '',
          address: order.shippingAddress?.street ?? '',
          merchant_invoice_id: order.orderNumber,
          cash_collection_amount: order.paymentMethod === 'cod' ? (order.totalAmount ?? 0) : 0,
          parcel_weight: 500,
          value: order.totalAmount ?? 0,
          delivery_area: order.shippingAddress?.city ?? 'Dhaka',
          delivery_area_id: 1,
          pickup_store_id: this.config.get('REDX_PICKUP_STORE_ID') ?? '',
        }),
      });
      const data: any = await response.json();
      if (!data.tracking_id) throw new Error(data.message ?? 'RedX API error');

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 4);
      return { trackingNumber: String(data.tracking_id), courier: 'redx', estimatedDelivery: deliveryDate };
    } catch (err: any) {
      this.logger.error(`RedX shipment failed: ${err.message}`);
      throw new BadRequestException('RedX shipment creation failed. Use manual tracking.');
    }
  }

  // â”€â”€â”€ Manual / Sundarban â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private async _createManualShipment(
    order: any,
    trackingNumber: string,
    courier: string,
    estimatedDays: number = 5,
  ): Promise<ShipmentResult> {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
    return { trackingNumber, courier, estimatedDelivery: deliveryDate };
  }

  /** Public endpoint for pre-existing manual creation by orderId string */
  async createManualShipment(
    orderId: string,
    trackingNumber: string,
    courier: string,
    estimatedDays: number = 5,
  ): Promise<ShipmentResult> {
    const order = await this.orderModel.findById(orderId).lean();
    if (!order) throw new NotFoundException('Order not found');
    const result = await this._createManualShipment(order, trackingNumber, courier, estimatedDays);
    await this.orderModel.findByIdAndUpdate(orderId, {
      $set: {
        'items.$[].trackingNumber': trackingNumber,
        'items.$[].courier': courier,
        'items.$[].shippedAt': new Date(),
        'items.$[].status': 'shipped',
        status: 'shipped',
        shippedAt: new Date(),
        estimatedDelivery: result.estimatedDelivery,
      },
    });
    return result;
  }

  // â”€â”€â”€ Get shipment info for an order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getOrderShipment(orderId: string): Promise<TrackingResult & { trackingNumber?: string; courier?: string; estimatedDelivery?: Date }> {
    const order = await this.orderModel.findById(orderId).lean();
    if (!order) throw new NotFoundException('Order not found');

    const firstItem: any = order.items?.[0];
    const trackingNumber: string | undefined = firstItem?.trackingNumber || (order as any).trackingNumber;
    const courier: string | undefined = firstItem?.courier || (order as any).courier;

    if (!trackingNumber || !courier) {
      return {
        status: order.status,
        events: this.buildStatusEvents(order),
        estimatedDelivery: (order as any).estimatedDelivery,
      };
    }

    const liveTracking = await this.trackShipment(trackingNumber, courier as CourierProvider).catch(() => null);
    return {
      ...(liveTracking ?? { status: order.status, events: [] }),
      trackingNumber,
      courier,
      estimatedDelivery: (order as any).estimatedDelivery,
    };
  }

  private buildStatusEvents(order: any): TrackingEvent[] {
    const events: TrackingEvent[] = [];
    const add = (date: Date | undefined, desc: string) => {
      if (date) events.push({ timestamp: new Date(date), description: desc });
    };
    add(order.createdAt, 'Order placed');
    add(order.confirmedAt, 'Order confirmed');
    add(order.processedAt, 'Order in processing');
    add(order.shippedAt, 'Handed to courier');
    add(order.deliveredAt, 'Delivered');
    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // â”€â”€â”€ Track Shipment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async trackShipment(trackingNumber: string, courier: CourierProvider): Promise<TrackingResult> {
    switch (courier) {
      case 'steadfast':
        return this.trackSteadfast(trackingNumber);
      case 'pathao':
        return this.trackPathao(trackingNumber);
      case 'redx':
        return this.trackRedx(trackingNumber);
      default:
        return {
          status: 'In Transit',
          courier,
          trackingNumber,
          events: [{ timestamp: new Date(), description: 'Shipment handed to courier', location: 'Warehouse' }],
        };
    }
  }

  private async trackPathao(trackingNumber: string): Promise<TrackingResult> {
    try {
      const token = await this.pathaoAuth();
      const response = await fetch(
        `https://hermes.pathao.com/api/v1/orders/${trackingNumber}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data: any = await response.json();
      const events: TrackingEvent[] = (data.data?.logs ?? []).map((l: any) => ({
        timestamp: new Date(l.created_at ?? Date.now()),
        description: l.log ?? 'Status update',
        location: l.location ?? '',
      }));
      return { status: data.data?.order_status ?? 'Unknown', events, trackingNumber, courier: 'pathao' };
    } catch {
      return { status: 'Tracking unavailable', events: [], trackingNumber, courier: 'pathao' };
    }
  }

  private async trackSteadfast(trackingNumber: string): Promise<TrackingResult> {
    try {
      const response = await fetch(
        `https://portal.steadfast.com.bd/api/v1/status_by_trackingcode?tracking_code=${trackingNumber}`,
        {
          headers: {
            'Api-Key': this.config.get('STEADFAST_API_KEY') ?? '',
            'Secret-Key': this.config.get('STEADFAST_API_SECRET') ?? '',
          },
        },
      );
      const data: any = await response.json();
      return {
        status: data.delivery_status ?? 'Unknown',
        events: [],
        trackingNumber,
        courier: 'steadfast',
      };
    } catch {
      return { status: 'Tracking unavailable', events: [], trackingNumber, courier: 'steadfast' };
    }
  }

  private async trackRedx(trackingNumber: string): Promise<TrackingResult> {
    try {
      const response = await fetch(
        `https://openapi.redx.com.bd/v1.0.0-beta/parcel/track/${trackingNumber}`,
        { headers: { 'API-ACCESS-TOKEN': `Bearer ${this.config.get('REDX_API_KEY') ?? ''}` } },
      );
      const data: any = await response.json();
      const events: TrackingEvent[] = (data.tracking ?? []).map((t: any) => ({
        timestamp: new Date(t.created_at ?? Date.now()),
        description: t.message ?? 'Update',
        location: t.location ?? '',
      }));
      return { status: data.status ?? 'Unknown', events, trackingNumber, courier: 'redx' };
    } catch {
      return { status: 'Tracking unavailable', events: [], trackingNumber, courier: 'redx' };
    }
  }

  // â”€â”€â”€ Webhook handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async handleSteadfastWebhook(payload: any): Promise<void> {
    const { invoice, status, tracking_code } = payload;
    if (!invoice) return;
    const statusMap: Record<string, string> = {
      delivered: 'delivered',
      partial_delivered: 'delivered',
      cancelled: 'cancelled',
      hold: 'processing',
      in_review: 'processing',
      unknown: 'shipped',
    };
    const mappedStatus = statusMap[status] ?? 'shipped';
    await this.orderModel.findOneAndUpdate(
      { orderNumber: invoice },
      {
        $set: {
          status: mappedStatus,
          ...(tracking_code ? { 'items.$[].trackingNumber': tracking_code } : {}),
          ...(mappedStatus === 'delivered' ? { deliveredAt: new Date() } : {}),
        },
      },
    );
    this.logger.log(`Steadfast webhook: order ${invoice} â†’ ${mappedStatus}`);
  }

  async handlePathaoWebhook(payload: any): Promise<void> {
    const { merchant_order_id, order_status, consignment_id } = payload;
    if (!merchant_order_id && !consignment_id) return;
    const statusMap: Record<string, string> = {
      Delivered: 'delivered',
      'Partially Delivered': 'delivered',
      Cancelled: 'cancelled',
      'Return to Courier': 'returned',
      'Picked Up': 'shipped',
      'In Transit': 'shipped',
    };
    const mappedStatus = statusMap[order_status] ?? 'shipped';
    const query = merchant_order_id
      ? { orderNumber: merchant_order_id }
      : { 'items.trackingNumber': consignment_id };
    await this.orderModel.findOneAndUpdate(query, {
      $set: {
        status: mappedStatus,
        ...(mappedStatus === 'delivered' ? { deliveredAt: new Date() } : {}),
      },
    });
    this.logger.log(`Pathao webhook: order ${merchant_order_id} â†’ ${mappedStatus}`);
  }

  // â”€â”€â”€ Shipping rate calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async calculateShippingRate(weight: number, city: string): Promise<{ rate: number; courier: string; estimatedDays: number }[]> {
    const insideDhaka = ['dhaka', 'narayanganj', 'gazipur', 'manikganj', 'munshiganj', 'narsingdi'];
    const isInsideDhaka = insideDhaka.some(c => city.toLowerCase().includes(c));

    const baseRate = isInsideDhaka ? 60 : 120;
    const extraPerKg = 20;
    const extraWeight = Math.max(0, weight - 0.5);
    const rate = baseRate + Math.ceil(extraWeight) * extraPerKg;

    return [
      { rate, courier: 'pathao', estimatedDays: isInsideDhaka ? 2 : 3 },
      { rate: rate + 10, courier: 'steadfast', estimatedDays: isInsideDhaka ? 2 : 4 },
      { rate: rate + 15, courier: 'paperfly', estimatedDays: isInsideDhaka ? 2 : 4 },
      { rate: rate + 20, courier: 'redx', estimatedDays: isInsideDhaka ? 2 : 4 },
      { rate: rate + 30, courier: 'sundarban', estimatedDays: isInsideDhaka ? 3 : 5 },
    ];
  }
}
