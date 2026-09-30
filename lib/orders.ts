import { apiFetch } from "./api";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string | null;
  };
}

export interface OrderStatusEvent {
  id: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "CARD" | "CASH_ON_DELIVERY";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  items: OrderItem[];
  statusHistory: OrderStatusEvent[];
}

interface OrdersResponse {
  orders: Order[];
}

interface OrderResponse {
  order: Order;
}

export async function getMyOrders(): Promise<Order[]> {
  const data = await apiFetch<OrdersResponse>("/orders");

  return data.orders;
}

export async function getOrderById(id: number): Promise<Order> {
  const data = await apiFetch<OrderResponse>(`/orders/${id}`);

  return data.order;
}
