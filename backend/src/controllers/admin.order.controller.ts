import type { Response } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";


// ============================================================
// GET ALL ORDERS
// GET /api/admin/orders
// Admin only
// ============================================================

export const getAllOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      message: "Failed to retrieve orders",
    });
  }
};


// ============================================================
// UPDATE ORDER STATUS
// PATCH /api/admin/orders/:id
// Admin only
// ============================================================

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status,

        // Only add a new timeline entry if the status is actually
        // changing — re-saving the same status shouldn't create a
        // duplicate entry.
        ...(existingOrder.status !== status && {
          statusHistory: {
            create: { status },
          },
        }),
      },
    });

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
};