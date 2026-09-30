import prisma from "../src/config/prisma.js";

async function main() {
  console.log("");
  console.log("========================================");
  console.log("SHOPORA PRODUCT CLEANUP");
  console.log("========================================");
  console.log("");

  // ============================================================
  // PRODUCTS THAT BELONG TO THE CURRENT SEED CATALOGUE
  // ============================================================

  const seedProducts = [
    // Electronics
    {
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      description:
        "Comfortable wireless headphones with immersive sound and long battery life.",
      price: 45000,
      compareAtPrice: 55000,
      stock: 25,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      categorySlug: "electronics",
    },
    {
      name: "Bluetooth Speaker",
      slug: "bluetooth-speaker",
      description:
        "Portable Bluetooth speaker with powerful sound and compact design.",
      price: 28000,
      compareAtPrice: 35000,
      stock: 30,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
      categorySlug: "electronics",
    },
    {
      name: "Digital Camera",
      slug: "digital-camera",
      description:
        "Compact digital camera suitable for photography and everyday content creation.",
      price: 185000,
      compareAtPrice: 210000,
      stock: 10,
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
      categorySlug: "electronics",
    },

    // Phones & Accessories
    {
      name: "Smart Watch",
      slug: "smart-watch",
      description:
        "Modern smartwatch with activity tracking, notifications and health-focused features.",
      price: 65000,
      compareAtPrice: 80000,
      stock: 20,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      categorySlug: "phones-accessories",
    },
    {
      name: "Wireless Earbuds",
      slug: "wireless-earbuds",
      description:
        "Compact wireless earbuds with clear audio and a portable charging case.",
      price: 35000,
      compareAtPrice: 45000,
      stock: 35,
      image:
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1",
      categorySlug: "phones-accessories",
    },
    {
      name: "USB-C Fast Charger",
      slug: "usb-c-fast-charger",
      description:
        "Fast USB-C wall charger designed for compatible smartphones and devices.",
      price: 12000,
      compareAtPrice: 16000,
      stock: 50,
      image:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0",
      categorySlug: "phones-accessories",
    },

    // Computing
    {
      name: "Mechanical Keyboard",
      slug: "mechanical-keyboard",
      description:
        "Responsive mechanical keyboard designed for productivity and gaming.",
      price: 55000,
      compareAtPrice: 65000,
      stock: 18,
      image:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
      categorySlug: "computing",
    },
    {
      name: "Wireless Mouse",
      slug: "wireless-mouse",
      description:
        "Ergonomic wireless mouse with precise tracking and comfortable grip.",
      price: 18000,
      compareAtPrice: 22000,
      stock: 40,
      image:
        "https://images.unsplash.com/photo-1527814050087-3793815479db",
      categorySlug: "computing",
    },
    {
      name: "Laptop Stand",
      slug: "laptop-stand",
      description:
        "Adjustable laptop stand designed to improve desk ergonomics.",
      price: 25000,
      compareAtPrice: 32000,
      stock: 25,
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
      categorySlug: "computing",
    },
    {
      name: "27-inch Monitor",
      slug: "27-inch-monitor",
      description:
        "Large high-resolution monitor suitable for work, design and entertainment.",
      price: 220000,
      compareAtPrice: 260000,
      stock: 8,
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
      categorySlug: "computing",
    },

    // Fashion
    {
      name: "Classic Cotton T-Shirt",
      slug: "classic-cotton-t-shirt",
      description:
        "Comfortable everyday cotton T-shirt with a clean classic fit.",
      price: 12000,
      compareAtPrice: 16000,
      stock: 50,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      categorySlug: "fashion",
    },
    {
      name: "Premium Denim Jacket",
      slug: "premium-denim-jacket",
      description:
        "Classic denim jacket designed for casual everyday styling.",
      price: 45000,
      compareAtPrice: 55000,
      stock: 20,
      image:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5",
      categorySlug: "fashion",
    },
    {
      name: "Casual Sneakers",
      slug: "casual-sneakers",
      description:
        "Versatile casual sneakers designed for everyday comfort.",
      price: 38000,
      compareAtPrice: 48000,
      stock: 30,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      categorySlug: "fashion",
    },
    {
      name: "Leather Handbag",
      slug: "leather-handbag",
      description:
        "Elegant leather handbag suitable for everyday and formal use.",
      price: 75000,
      compareAtPrice: 95000,
      stock: 12,
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
      categorySlug: "fashion",
    },
    {
      name: "Formal Dress Shoes",
      slug: "formal-dress-shoes",
      description:
        "Classic formal shoes suitable for business and special occasions.",
      price: 65000,
      compareAtPrice: 80000,
      stock: 15,
      image:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
      categorySlug: "fashion",
    },
    {
      name: "Classic Polo Shirt",
      slug: "classic-polo-shirt",
      description:
        "Smart casual polo shirt made for comfortable everyday wear.",
      price: 18000,
      compareAtPrice: 23000,
      stock: 35,
      image:
        "https://images.unsplash.com/photo-1625910513413-5fc45c7e2c3c",
      categorySlug: "fashion",
    },
    {
      name: "Slim Fit Chinos",
      slug: "slim-fit-chinos",
      description:
        "Modern slim-fit chinos suitable for smart casual outfits.",
      price: 25000,
      compareAtPrice: 32000,
      stock: 25,
      image:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a",
      categorySlug: "fashion",
    },

    // Watches & Accessories
    {
      name: "Classic Leather Watch",
      slug: "classic-leather-watch",
      description:
        "Elegant classic watch with a leather strap and timeless design.",
      price: 55000,
      compareAtPrice: 70000,
      stock: 15,
      image:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
      categorySlug: "watches-accessories",
    },
    {
      name: "Minimalist Wristwatch",
      slug: "minimalist-wristwatch",
      description:
        "Minimalist wristwatch with a clean face and modern styling.",
      price: 48000,
      compareAtPrice: 60000,
      stock: 20,
      image:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
      categorySlug: "watches-accessories",
    },
    {
      name: "Stainless Steel Watch",
      slug: "stainless-steel-watch",
      description:
        "Durable stainless steel wristwatch suitable for everyday wear.",
      price: 85000,
      compareAtPrice: 100000,
      stock: 10,
      image:
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
      categorySlug: "watches-accessories",
    },
    {
      name: "Classic Sunglasses",
      slug: "classic-sunglasses",
      description:
        "Stylish sunglasses with a timeless frame for everyday use.",
      price: 22000,
      compareAtPrice: 30000,
      stock: 30,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
      categorySlug: "watches-accessories",
    },

    // Home & Living
    {
      name: "Minimal Desk Lamp",
      slug: "minimal-desk-lamp",
      description:
        "Modern desk lamp with a minimalist design for workspaces and bedrooms.",
      price: 18000,
      compareAtPrice: 24000,
      stock: 25,
      image:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
      categorySlug: "home-living",
    },
    {
      name: "Decorative Indoor Plant",
      slug: "decorative-indoor-plant",
      description:
        "Decorative indoor plant that adds a natural touch to living spaces.",
      price: 15000,
      compareAtPrice: 20000,
      stock: 20,
      image:
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411",
      categorySlug: "home-living",
    },
    {
      name: "Modern Throw Pillow",
      slug: "modern-throw-pillow",
      description:
        "Soft decorative throw pillow designed to complement modern interiors.",
      price: 10000,
      compareAtPrice: 14000,
      stock: 35,
      image:
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2",
      categorySlug: "home-living",
    },
    {
      name: "Modern Wall Clock",
      slug: "modern-wall-clock",
      description:
        "Clean modern wall clock suitable for living rooms, offices and bedrooms.",
      price: 14000,
      compareAtPrice: 18000,
      stock: 25,
      image:
        "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c",
      categorySlug: "home-living",
    },
    {
      name: "Cotton Bedsheet Set",
      slug: "cotton-bedsheet-set",
      description:
        "Soft cotton bedsheet set designed for comfortable everyday use.",
      price: 28000,
      compareAtPrice: 35000,
      stock: 18,
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
      categorySlug: "home-living",
    },

    // Kitchen & Dining
    {
      name: "Electric Kettle",
      slug: "electric-kettle",
      description:
        "Fast-boiling electric kettle suitable for tea, coffee and hot water.",
      price: 22000,
      compareAtPrice: 28000,
      stock: 30,
      image:
        "https://images.unsplash.com/photo-1594213114663-d94db9b171e0",
      categorySlug: "kitchen-dining",
    },
    {
      name: "Ceramic Dinner Set",
      slug: "ceramic-dinner-set",
      description:
        "Elegant ceramic dinner set for everyday meals and entertaining.",
      price: 45000,
      compareAtPrice: 55000,
      stock: 12,
      image:
        "https://images.unsplash.com/photo-1603199506016-b9a594b593c0",
      categorySlug: "kitchen-dining",
    },
    {
      name: "Kitchen Knife Set",
      slug: "kitchen-knife-set",
      description:
        "Multi-piece kitchen knife set designed for everyday food preparation.",
      price: 30000,
      compareAtPrice: 38000,
      stock: 20,
      image:
        "https://images.unsplash.com/photo-1593618998160-e34014e67546",
      categorySlug: "kitchen-dining",
    },

    // Beauty & Personal Care
    {
      name: "Facial Skincare Set",
      slug: "facial-skincare-set",
      description:
        "Everyday skincare essentials designed for a simple personal-care routine.",
      price: 32000,
      compareAtPrice: 40000,
      stock: 25,
      image:
        "https://images.unsplash.com/photo-1556228720-195a672e8a03",
      categorySlug: "beauty-personal-care",
    },
    {
      name: "Perfume Collection",
      slug: "perfume-collection",
      description:
        "A curated perfume collection with elegant fragrances for different occasions.",
      price: 55000,
      compareAtPrice: 70000,
      stock: 18,
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601",
      categorySlug: "beauty-personal-care",
    },
    {
      name: "Hair Care Essentials",
      slug: "hair-care-essentials",
      description:
        "Hair-care essentials for everyday grooming and maintenance.",
      price: 25000,
      compareAtPrice: 32000,
      stock: 30,
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e",
      categorySlug: "beauty-personal-care",
    },
    {
      name: "Body Care Set",
      slug: "body-care-set",
      description:
        "Body-care essentials for a simple and refreshing daily routine.",
      price: 28000,
      compareAtPrice: 35000,
      stock: 25,
      image:
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b",
      categorySlug: "beauty-personal-care",
    },
    {
      name: "Luxury Bath Set",
      slug: "luxury-bath-set",
      description:
        "Premium bath essentials designed for a relaxing personal-care experience.",
      price: 35000,
      compareAtPrice: 45000,
      stock: 15,
      image:
        "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2",
      categorySlug: "beauty-personal-care",
    },

    // Sports & Fitness
    {
      name: "Adjustable Dumbbell Set",
      slug: "adjustable-dumbbell-set",
      description:
        "Adjustable dumbbell set suitable for strength training and home workouts.",
      price: 85000,
      compareAtPrice: 100000,
      stock: 12,
      image:
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
      categorySlug: "sports-fitness",
    },

    // Books & Stationery
    {
      name: "Business Strategy Book",
      slug: "business-strategy-book",
      description:
        "Practical business strategy book for entrepreneurs and professionals.",
      price: 12000,
      compareAtPrice: 16000,
      stock: 30,
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72",
      categorySlug: "books-stationery",
    },
    {
      name: "Premium Notebook",
      slug: "premium-notebook",
      description:
        "Premium notebook suitable for planning, journaling and professional notes.",
      price: 8500,
      compareAtPrice: 12000,
      stock: 50,
      image:
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57",
      categorySlug: "books-stationery",
    },
    {
      name: "Productivity Planner",
      slug: "productivity-planner",
      description:
        "Structured planner designed to help organize goals, tasks and routines.",
      price: 10000,
      compareAtPrice: 14000,
      stock: 35,
      image:
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
      categorySlug: "books-stationery",
    },
    {
      name: "Creative Sketchbook",
      slug: "creative-sketchbook",
      description:
        "High-quality sketchbook suitable for drawing, design and creative work.",
      price: 9000,
      compareAtPrice: 12000,
      stock: 40,
      image:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
      categorySlug: "books-stationery",
    },
  ];

  // ============================================================
  // 1. RESTORE ANY MISSING SEED PRODUCTS
  // ============================================================

  console.log(
    `Seed catalogue contains ${seedProducts.length} products.`
  );
  console.log("");

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
    },
  });

  const categoryMap = new Map(
    categories.map((category) => [
      category.slug,
      category.id,
    ])
  );

  console.log("Checking for missing seed products...");

  for (const product of seedProducts) {
    const categoryId = categoryMap.get(
      product.categorySlug
    );

    if (!categoryId) {
      throw new Error(
        `Category "${product.categorySlug}" not found.`
      );
    }

    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        image: product.image,
        categoryId,
        status: "ACTIVE",
      },
    });
  }

  console.log("✅ Seed catalogue verified/restored.");
  console.log("");

  // ============================================================
  // 2. FIND PRODUCTS THAT DO NOT BELONG
  // ============================================================

  const currentProducts =
    await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

  const seedSlugs = seedProducts.map(
    (product) => product.slug
  );

  const unwantedProducts =
    currentProducts.filter(
      (product) =>
        !seedSlugs.includes(product.slug)
    );

  console.log(
    `Current products: ${currentProducts.length}`
  );
  console.log(
    `Expected seed products: ${seedProducts.length}`
  );
  console.log(
    `Products outside seed catalogue: ${unwantedProducts.length}`
  );
  console.log("");

  // ============================================================
  // 3. DELETE UNWANTED PRODUCTS SAFELY
  // ============================================================
  //
  // IMPORTANT:
  // We delete products individually.
  //
  // If an existing OrderItem references a product,
  // PostgreSQL will reject that deletion.
  //
  // In that situation we KEEP the product because deleting
  // the product would destroy referential integrity/order history.
  // ============================================================

  const deletedProducts: string[] = [];
  const protectedProducts: string[] = [];

  for (const product of unwantedProducts) {
    try {
      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });

      deletedProducts.push(product.slug);

      console.log(
        `🗑️ Deleted: [${product.category.name}] ${product.name}`
      );
    } catch (error: any) {
      if (error?.code === "P2003") {
        protectedProducts.push(product.slug);

        console.log(
          `🔒 Kept: [${product.category.name}] ${product.name}`
        );
        console.log(
          "   Reason: existing order history references this product."
        );
      } else {
        throw error;
      }
    }
  }

  // ============================================================
  // 4. FINAL SUMMARY
  // ============================================================

  const finalProductCount =
    await prisma.product.count();

  console.log("");
  console.log("========================================");
  console.log("CLEANUP COMPLETE");
  console.log("========================================");

  console.log(
    `Seed catalogue: ${seedProducts.length}`
  );

  console.log(
    `Products deleted: ${deletedProducts.length}`
  );

  console.log(
    `Products protected by orders: ${protectedProducts.length}`
  );

  console.log(
    `Products currently in database: ${finalProductCount}`
  );

  if (protectedProducts.length > 0) {
    console.log("");
    console.log(
      "Protected products:"
    );

    for (const slug of protectedProducts) {
      console.log(`🔒 ${slug}`);
    }

    console.log("");
    console.log(
      "These products were NOT deleted because they are referenced"
    );
    console.log(
      "by existing orders. Their records must remain for order history."
    );
  }

  console.log("");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ PRODUCT CLEANUP FAILED");
    console.error("----------------------------------------");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });