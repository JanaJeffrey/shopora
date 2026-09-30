import type { Response } from "express";
import axios from "axios";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not defined in .env");
}

const PAYSTACK_BASE_URL = "https://api.paystack.co";


// ============================================================
// INITIALIZE PAYSTACK PAYMENT
// POST /api/payments/initialize
// Authenticated users
// ============================================================

export const initializePayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const {
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
    } = req.body;

    // --------------------------------------------------------
    // Validate shipping information
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Get authenticated user's email
    // --------------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    // --------------------------------------------------------
    // Get user's cart
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // Validate products and calculate total
    // --------------------------------------------------------

    let totalAmount = 0;

    for (const item of cart.items) {
      if (item.product.status !== "ACTIVE") {
        return res.status(400).json({
          message: `${item.product.name} is no longer available`,
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.name}`,
        });
      }

      totalAmount +=
        Number(item.product.price) * item.quantity;
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount",
      });
    }

    // --------------------------------------------------------
    // Generate Paystack reference
    // --------------------------------------------------------

    const reference = `SHOPORA-${userId}-${Date.now()}`;

    // --------------------------------------------------------
    // Create pending order
    // --------------------------------------------------------

    const order = await prisma.order.create({
      data: {
        userId,

        paymentMethod: "CARD",

        paymentStatus: "PENDING",

        status: "PENDING",

        totalAmount,

        paystackReference: reference,

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
      },
    });

    // --------------------------------------------------------
    // Initialize transaction with Paystack
    // --------------------------------------------------------

    const paystackResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: user.email,

        // Paystack expects the amount in kobo.
        amount: Math.round(totalAmount * 100),

        reference,

        // Where Paystack redirects the customer after payment.
        // Our frontend reads `?reference=` there and calls
        // GET /api/payments/verify/:reference to finalize the order.
        callback_url: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/checkout/callback`,

        metadata: {
          orderId: order.id,
          userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // --------------------------------------------------------
    // Check Paystack response
    // --------------------------------------------------------

    if (
      !paystackResponse.data?.status ||
      !paystackResponse.data?.data?.authorization_url
    ) {
      await prisma.order.delete({
        where: {
          id: order.id,
        },
      });

      return res.status(500).json({
        message: "Unable to initialize Paystack payment",
      });
    }

    return res.status(200).json({
      message: "Payment initialized successfully",

      authorizationUrl:
        paystackResponse.data.data.authorization_url,

      reference:
        paystackResponse.data.data.reference,

      orderId: order.id,
    });
  } catch (error) {
    console.error(
      "Initialize Paystack payment error:",
      error
    );

    return res.status(500).json({
      message: "Failed to initialize payment",
    });
  }
};


// ============================================================
// VERIFY PAYSTACK PAYMENT
// GET /api/payments/verify/:reference
// Authenticated users
// ============================================================

export const verifyPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const referenceParam = req.params.reference;

    // --------------------------------------------------------
    // Validate reference
    // --------------------------------------------------------

    if (
      typeof referenceParam !== "string" ||
      !referenceParam
    ) {
      return res.status(400).json({
        message: "Payment reference is required",
      });
    }

    const reference = referenceParam;

    // --------------------------------------------------------
    // Find order
    // --------------------------------------------------------

    const order = await prisma.order.findFirst({
      where: {
        paystackReference: reference,
        userId: req.user!.id,
      },
    });

    if (!order) {
      return res.status(404).json({
        message:
          "Order associated with this payment was not found",
      });
    }

    // --------------------------------------------------------
    // Prevent duplicate processing
    // --------------------------------------------------------

    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        message: "Payment already verified",
        order,
      });
    }

    // --------------------------------------------------------
    // Get order items
    // --------------------------------------------------------

    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId: order.id,
      },

      include: {
        product: true,
      },
    });

    if (orderItems.length === 0) {
      return res.status(400).json({
        message: "Order contains no products",
      });
    }

    // --------------------------------------------------------
    // Verify transaction with Paystack
    // --------------------------------------------------------

    const paystackResponse = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = paystackResponse.data?.data;

    if (
      !paystackResponse.data?.status ||
      !paymentData
    ) {
      return res.status(400).json({
        message:
          "Unable to verify Paystack transaction",
      });
    }

    // --------------------------------------------------------
    // Check Paystack payment status
    // --------------------------------------------------------

    if (paymentData.status !== "success") {
      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentStatus: "FAILED",
        },
      });

      return res.status(400).json({
        message: "Payment was not successful",
        status: paymentData.status,
      });
    }

    // --------------------------------------------------------
    // Verify payment amount
    // --------------------------------------------------------

    const paidAmount =
      Number(paymentData.amount) / 100;

    if (
      paidAmount !== Number(order.totalAmount)
    ) {
      return res.status(400).json({
        message:
          "Payment amount does not match order amount",
      });
    }

    // --------------------------------------------------------
    // Complete order
    // --------------------------------------------------------

    const completedOrder =
      await prisma.$transaction(async (transaction) => {

        // -----------------------------------------------
        // Re-check product stock
        // -----------------------------------------------

        for (const item of orderItems) {
          const product =
            await transaction.product.findUnique({
              where: {
                id: item.productId,
              },
            });

          if (!product) {
            throw new Error(
              `Product ${item.productId} no longer exists`
            );
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Not enough stock for ${product.name}`
            );
          }
        }

        // -----------------------------------------------
        // Reduce stock
        // -----------------------------------------------

        for (const item of orderItems) {
          await transaction.product.update({
            where: {
              id: item.productId,
            },

            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // -----------------------------------------------
        // Mark order as paid
        // -----------------------------------------------

        const updatedOrder =
          await transaction.order.update({
            where: {
              id: order.id,
            },

            data: {
              paymentStatus: "PAID",
              status: "PROCESSING",
            },
          });

        // -----------------------------------------------
        // Clear customer's cart
        // -----------------------------------------------

        const cart =
          await transaction.cart.findUnique({
            where: {
              userId: req.user!.id,
            },
          });

        if (cart) {
          await transaction.cartItem.deleteMany({
            where: {
              cartId: cart.id,
            },
          });
        }

        return updatedOrder;
      });

    return res.status(200).json({
      message: "Payment verified successfully",
      order: completedOrder,
    });
  } catch (error) {
    console.error(
      "Verify Paystack payment error:",
      error
    );

    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};