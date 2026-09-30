import { Check, Clock, Package, ShoppingBag, Truck, XCircle } from "lucide-react";
import type { Order, OrderStatus } from "../lib/orders";

const STAGES: {
  status: OrderStatus;
  label: string;
  icon: typeof ShoppingBag;
}[] = [
  { status: "PENDING", label: "Order placed", icon: ShoppingBag },
  { status: "PROCESSING", label: "Processing", icon: Package },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: Check },
];

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderTrackingTimelineProps {
  order: Order;
}

export default function OrderTrackingTimeline({
  order,
}: OrderTrackingTimelineProps) {
  // Cancelled orders don't follow the normal linear path, so they get
  // their own simple state instead of a stepper that would otherwise
  // misleadingly show partial "progress" toward delivery.
  if (order.status === "CANCELLED") {
    const cancelledEvent = order.statusHistory.find(
      (event) => event.status === "CANCELLED"
    );

    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
        <XCircle size={22} className="shrink-0 text-red-600" />

        <div>
          <p className="text-sm font-bold text-red-700">
            Order cancelled
          </p>

          {cancelledEvent && (
            <p className="text-xs text-red-600">
              {formatTimestamp(cancelledEvent.createdAt)}
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex(
    (stage) => stage.status === order.status
  );

  return (
    <div className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
      {STAGES.map((stage, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        const event = order.statusHistory.find(
          (item) => item.status === stage.status
        );

        return (
          <div
            key={stage.status}
            className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
          >
            <div className="flex flex-col items-center sm:w-full sm:flex-row">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  isComplete
                    ? "border-(--primary) bg-(--primary) text-white"
                    : "border-(--border) bg-(--surface) text-(--muted)"
                }`}
              >
                <stage.icon size={17} />
              </div>

              {/* Connector line to the next stage */}
              {index < STAGES.length - 1 && (
                <div
                  className={`hidden h-0.5 flex-1 sm:block ${
                    index < currentIndex
                      ? "bg-(--primary)"
                      : "bg-(--border)"
                  }`}
                />
              )}
            </div>

            <div className="pb-6 sm:pb-0">
              <p
                className={`text-sm font-bold ${
                  isComplete ? "text-(--text)" : "text-(--muted)"
                }`}
              >
                {stage.label}
                {isCurrent && (
                  <span className="ml-1.5 inline-flex items-center gap-1 text-xs font-semibold text-(--primary)">
                    <Clock size={12} />
                    Current
                  </span>
                )}
              </p>

              {event && (
                <p className="mt-0.5 text-xs text-(--muted)">
                  {formatTimestamp(event.createdAt)}
                </p>
              )}
            </div>

            {/* Mobile connector line (vertical) */}
            {index < STAGES.length - 1 && (
              <div
                className={`ml-5 h-6 w-0.5 sm:hidden ${
                  index < currentIndex
                    ? "bg-(--primary)"
                    : "bg-(--border)"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
