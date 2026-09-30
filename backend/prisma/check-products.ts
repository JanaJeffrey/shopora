import prisma from "../src/config/prisma.js";

async function main() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: [
      {
        category: {
          name: "asc",
        },
      },
      {
        name: "asc",
      },
    ],
  });

  console.log("");
  console.log("========================================");
  console.log("SHOPORA PRODUCT INVENTORY");
  console.log("========================================");
  console.log("");

  for (const product of products) {
    console.log(
      `[${product.category.name}] ${product.name}`
    );
    console.log(`  ID: ${product.id}`);
    console.log(`  Slug: ${product.slug}`);
    console.log(`  Status: ${product.status}`);
    console.log("");
  }

  console.log(
    `Total products: ${products.length}`
  );

  console.log("");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("❌ Failed to retrieve products:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });