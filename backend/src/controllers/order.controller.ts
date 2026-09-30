import type { Response } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================================
// CHECKOUT
// POST /api/orders/checkout
// Authenticated users
// ============================================================

export const checkout = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const {
      paymentMethod,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
    } = req.body;

    // ==========================================================
    // VALIDATE PAYMENT METHOD
    // ==========================================================

    if (
      paymentMethod !== "CASH_ON_DELIVERY" &&
      paymentMethod !== "CARD"
    ) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // ==========================================================
    // VALIDATE SHIPPING INFORMATION
    // ==========================================================

    if (
      !shippingName ||
      !shippingPhone ||
      !shippingAddress ||
      !shippingCity ||
      !shippingState
    ) {
      return res.status(400).json({
        message: "Complete shipping information is required",
      });
    }

    // ==========================================================
    // GET USER CART
    // ==========================================================

    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    // ==========================================================
    // VALIDATE PRODUCTS + CALCULATE TOTAL
    // ==========================================================

    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;

      // Product must still be active
      if (product.status !== "ACTIVE") {
        return res.status(400).json({
          message: `${product.name} is no longer available`,
        });
      }

      // Make sure requested quantity is available
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      totalAmount +=
        Number(product.price) * item.quantity;
    }

    // ==========================================================
    // PAYMENT STATUS
    //
    // CASH ON DELIVERY:
    //   Payment remains PENDING.
    //
    // CARD:
    //   Payment also remains PENDING until Paystack
    //   successfully verifies the transaction.
    // ==========================================================

    const paymentStatus = "PENDING";

    // ==========================================================
    // CREATE ORDER
    // ==========================================================

    const order = await prisma.order.create({
      data: {
        userId,

        paymentMethod,

        paymentStatus,

        status: "PENDING",

        totalAmount,

        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingState,

        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.product.price),
          })),
        },

        // The first entry in this order's tracking timeline.
        statusHistory: {
          create: { status: "PENDING" },
        },
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // ==========================================================
    // CASH ON DELIVERY
    //
    // COD orders can immediately proceed to processing.
    // We reduce stock and clear the cart here.
    // ==========================================================

    if (paymentMethod === "CASH_ON_DELIVERY") {
      const finalizedOrder = await prisma.$transaction(
        async (transaction) => {
          // ----------------------------------------------------
          // Reduce stock
          // ----------------------------------------------------

          for (const item of cart.items) {
            const updatedProduct =
              await transaction.product.updateMany({
                where: {
                  id: item.productId,
                  status: "ACTIVE",
                  stock: {
                    gte: item.quantity,
                  },
                },

                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              });

            // This protects us against two customers attempting
            // to purchase the last available units at once.
            if (updatedProduct.count === 0) {
              throw new Error(
                `Stock changed for ${item.product.name}. Please try again.`
              );
            }
          }

          // ----------------------------------------------------
          // Move order to processing
          // ----------------------------------------------------

          const updatedOrder =
            await transaction.order.update({
              where: {
                id: order.id,
              },

              data: {
                status: "PROCESSING",

                statusHistory: {
                  create: { status: "PROCESSING" },
                },
              },

              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            });

          // ----------------------------------------------------
          // Clear cart
          // ----------------------------------------------------

          await transaction.cartItem.deleteMany({
            where: {
              cartId: cart.id,
            },
          });

          return updatedOrder;
        }
      );

      return res.status(201).json({
        message: "Order placed successfully",
        paymentRequired: false,
        order: finalizedOrder,
      });
    }

    // ==========================================================
    // CARD PAYMENT
    //
    // IMPORTANT:
    // We DO NOT:
    //   - mark the order as PAID
    //   - reduce stock
    //   - clear the cart
    //
    // Paystack payment initialization/verification will handle
    // that in the payment controller.
    // ==========================================================

    return res.status(201).json({
      message: "Order created. Payment is required.",
      paymentRequired: true,
      order,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Checkout failed",
    });
  }
};

// ============================================================
// GET MY ORDERS
// GET /api/orders
// Authenticated users
// ============================================================

export const getMyOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user!.id,
      },

      include: {
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
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Failed to retrieve orders",
    });
  }
};

// ============================================================
// GET SINGLE ORDER
// GET /api/orders/:id
// Authenticated users
// ============================================================

export const getOrderById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,

        // A customer can only access their own order.
        userId: req.user!.id,
      },

      include: {
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
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Failed to retrieve order",
    });
  }
};