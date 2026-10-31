import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed cuisines
  const cuisines = [
    { name: 'Italian', slug: 'italian' },
    { name: 'Mexican', slug: 'mexican' },
    { name: 'Japanese', slug: 'japanese' },
    { name: 'Indian', slug: 'indian' },
    { name: 'Chinese', slug: 'chinese' },
    { name: 'French', slug: 'french' },
    { name: 'Thai', slug: 'thai' },
    { name: 'Mediterranean', slug: 'mediterranean' },
  ];

  for (const cuisine of cuisines) {
    await prisma.cuisine.upsert({
      where: { slug: cuisine.slug },
      update: {},
      create: cuisine,
    });
  }

  console.log('✓ Cuisines seeded');

  // Seed diet tags
  const dietTags = [
    { name: 'Vegetarian', slug: 'vegetarian' },
    { name: 'Vegan', slug: 'vegan' },
    { name: 'Gluten-Free', slug: 'gluten-free' },
    { name: 'Dairy-Free', slug: 'dairy-free' },
    { name: 'Halal', slug: 'halal' },
    { name: 'Kosher', slug: 'kosher' },
    { name: 'Paleo', slug: 'paleo' },
    { name: 'Keto', slug: 'keto' },
  ];

  for (const tag of dietTags) {
    await prisma.dietTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log('✓ Diet tags seeded');

  // Seed basic ingredients
  const ingredients = [
    { name: 'Tomatoes', defaultUnit: 'KG', aliases: ['tomato'], tags: ['vegetable'] },
    { name: 'Onions', defaultUnit: 'KG', aliases: ['onion'], tags: ['vegetable'] },
    { name: 'Garlic', defaultUnit: 'G', aliases: [], tags: ['vegetable'] },
    { name: 'Olive Oil', defaultUnit: 'ML', aliases: ['oil'], tags: ['oil'] },
    { name: 'Salt', defaultUnit: 'G', aliases: [], tags: ['seasoning'] },
    { name: 'Black Pepper', defaultUnit: 'G', aliases: ['pepper'], tags: ['seasoning'] },
    { name: 'Chicken Breast', defaultUnit: 'KG', aliases: ['chicken'], tags: ['protein', 'meat'] },
    { name: 'Beef', defaultUnit: 'KG', aliases: [], tags: ['protein', 'meat'] },
    { name: 'Rice', defaultUnit: 'KG', aliases: [], tags: ['grain'] },
    { name: 'Pasta', defaultUnit: 'KG', aliases: [], tags: ['grain'] },
  ];

  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: ingredient.name },
      update: {},
      create: ingredient as any,
    });
  }

  console.log('✓ Ingredients seeded');

  // Seed retailers
  const retailers = [
    { name: 'Tesco', type: 'SUPERMARKET', country: 'GB', url: 'https://www.tesco.com' },
    { name: 'Sainsburys', type: 'SUPERMARKET', country: 'GB', url: 'https://www.sainsburys.co.uk' },
    { name: 'Waitrose', type: 'SUPERMARKET', country: 'GB', url: 'https://www.waitrose.com' },
  ];

  for (const retailer of retailers) {
    await prisma.retailer.upsert({
      where: { name_country: { name: retailer.name, country: retailer.country || '' } },
      update: {},
      create: retailer as any,
    });
  }

  console.log('✓ Retailers seeded');

  // Seed coupons
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Welcome discount - 10% off your first booking',
      percentOff: 10,
      isActive: true,
    },
    {
      code: 'SUMMER25',
      description: 'Summer special - 25% off',
      percentOff: 25,
      redeemBy: new Date('2025-09-01'),
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }

  console.log('✓ Coupons seeded');

  // Seed test users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      image: '/images/users/alice-profile.jpg',
      roles: ['USER'],
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      image: '/images/users/bob-profile.jpg',
      roles: ['USER'],
    },
  });

  // Seed admin users
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Sarah Admin',
      image: '/images/users/admin1-profile.jpg',
      roles: ['USER', 'ADMIN'],
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      name: 'Michael SuperAdmin',
      image: '/images/users/admin2-profile.jpg',
      roles: ['USER', 'ADMIN', 'SUPERADMIN'],
    },
  });

  const chefUser1 = await prisma.user.upsert({
    where: { email: 'chef.maria@example.com' },
    update: {},
    create: {
      email: 'chef.maria@example.com',
      name: 'Maria Garcia',
      image: '/images/chefs/maria-profile.jpg',
      roles: ['USER', 'CHEF'],
    },
  });

  const chefUser2 = await prisma.user.upsert({
    where: { email: 'chef.james@example.com' },
    update: {},
    create: {
      email: 'chef.james@example.com',
      name: 'James Wilson',
      image: '/images/chefs/james-profile.jpg',
      roles: ['USER', 'CHEF'],
    },
  });

  console.log('✓ Users seeded');

  // Seed chef profiles
  const italianCuisine = await prisma.cuisine.findUnique({ where: { slug: 'italian' } });
  const mexicanCuisine = await prisma.cuisine.findUnique({ where: { slug: 'mexican' } });
  const mediterraneanCuisine = await prisma.cuisine.findUnique({ where: { slug: 'mediterranean' } });
  const vegetarianDiet = await prisma.dietTag.findUnique({ where: { slug: 'vegetarian' } });
  const veganDiet = await prisma.dietTag.findUnique({ where: { slug: 'vegan' } });

  const chef1 = await prisma.chefProfile.upsert({
    where: { userId: chefUser1.id },
    update: {},
    create: {
      userId: chefUser1.id,
      bio: 'Passionate Italian chef with 15 years of experience. Specializing in authentic Tuscan cuisine and modern Mediterranean dishes. I bring the taste of Italy to your table with fresh, locally-sourced ingredients and traditional cooking techniques passed down through generations.',
      verified: true,
      avgPricePerPerson: 45,
      avgRating: 0,
      reviewsCount: 0,
      travelRadiusKm: 25,
      languages: ['English', 'Spanish', 'Italian'],
      specialties: ['Pasta', 'Risotto', 'Seafood', 'Wood-fired Pizza'],
      cuisines: {
        create: [
          { cuisine: { connect: { id: italianCuisine!.id } } },
          { cuisine: { connect: { id: mediterraneanCuisine!.id } } },
        ],
      },
      dietTags: {
        create: [
          { diet: { connect: { id: vegetarianDiet!.id } } },
          { diet: { connect: { id: veganDiet!.id } } },
        ],
      },
      gallery: {
        create: [
          { url: '/images/chefs/maria/gallery-1.jpg', caption: 'Homemade Fettuccine Carbonara' },
          { url: '/images/chefs/maria/gallery-2.jpg', caption: 'Fresh Seafood Risotto' },
          { url: '/images/chefs/maria/gallery-3.jpg', caption: 'Margherita Pizza from Wood Oven' },
          { url: '/images/chefs/maria/gallery-4.jpg', caption: 'Tiramisu with Espresso' },
          { url: '/images/chefs/maria/gallery-5.jpg', caption: 'Caprese Salad with Fresh Mozzarella' },
          { url: '/images/chefs/maria/gallery-6.jpg', caption: 'Osso Buco with Gremolata' },
        ],
      },
    },
  });

  const chef2 = await prisma.chefProfile.upsert({
    where: { userId: chefUser2.id },
    update: {},
    create: {
      userId: chefUser2.id,
      bio: 'BBQ and grilling expert with a passion for slow-smoked meats and authentic flavors. 10+ years of competition BBQ experience. Love bringing people together with great food and good vibes. Specializing in Texas-style BBQ, Southern comfort food, and fusion dishes.',
      verified: true,
      avgPricePerPerson: 38,
      avgRating: 0,
      reviewsCount: 0,
      travelRadiusKm: 30,
      languages: ['English'],
      specialties: ['BBQ', 'Grilling', 'Smoked Meats', 'Southern Comfort Food'],
      cuisines: {
        create: [
          { cuisine: { connect: { id: mexicanCuisine!.id } } },
        ],
      },
      gallery: {
        create: [
          { url: '/images/chefs/james/gallery-1.jpg', caption: 'Slow-Smoked Brisket' },
          { url: '/images/chefs/james/gallery-2.jpg', caption: 'BBQ Ribs with House Sauce' },
          { url: '/images/chefs/james/gallery-3.jpg', caption: 'Pulled Pork Sliders' },
          { url: '/images/chefs/james/gallery-4.jpg', caption: 'Grilled Corn and Veggie Skewers' },
          { url: '/images/chefs/james/gallery-5.jpg', caption: 'Texas-Style Chili' },
          { url: '/images/chefs/james/gallery-6.jpg', caption: 'BBQ Platter Feast' },
        ],
      },
    },
  });

  console.log('✓ Chef profiles seeded');

  // Seed menus for chefs
  const mariaMenu1 = await prisma.menu.create({
    data: {
      chefId: chef1.id,
      title: 'Tuscan Evening',
      description: 'Authentic Italian dining experience featuring traditional Tuscan recipes passed down through generations',
      pricePerPerson: 45,
      minGuests: 4,
      maxGuests: 12,
      isActive: true,
    },
  });

  const jamesMenu1 = await prisma.menu.create({
    data: {
      chefId: chef2.id,
      title: 'BBQ Feast',
      description: 'Slow-smoked meats and classic BBQ sides for an unforgettable outdoor dining experience',
      pricePerPerson: 38,
      minGuests: 6,
      maxGuests: 20,
      isActive: true,
    },
  });

  console.log('✓ Menus seeded');

  // Seed completed bookings
  const booking1 = await prisma.booking.create({
    data: {
      userId: user1.id,
      chefId: chef1.id,
      menuId: mariaMenu1.id,
      date: new Date('2025-01-15T18:00:00Z'),
      guests: 8,
      status: 'COMPLETED',
      occasion: 'Dinner Party',
      notes: 'Looking forward to the authentic Italian experience!',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: user2.id,
      chefId: chef1.id,
      menuId: mariaMenu1.id,
      date: new Date('2025-02-20T19:00:00Z'),
      guests: 6,
      status: 'COMPLETED',
      occasion: 'Anniversary Celebration',
      notes: 'One guest has seafood allergy',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: user1.id,
      chefId: chef2.id,
      menuId: jamesMenu1.id,
      date: new Date('2025-03-10T17:00:00Z'),
      guests: 12,
      status: 'COMPLETED',
      occasion: 'Backyard BBQ Party',
      notes: 'We have space for outdoor setup and smoker',
    },
  });

  console.log('✓ Bookings seeded');

  // Seed conversations with messages
  const conv1 = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      bookingId: booking1.id,
      participants: {
        create: [
          { userId: user1.id },
          { userId: chefUser1.id },
        ],
      },
    },
  });

  const messages1 = [
    { senderId: user1.id, body: "Hi Maria! I'm so excited for our dinner party tomorrow!" },
    { senderId: chefUser1.id, body: "Hello Alice! Me too! Everything is prepared. Do you have any last-minute dietary restrictions I should know about?" },
    { senderId: user1.id, body: "No, we're all good! Can't wait to try your famous risotto!" },
    { senderId: chefUser1.id, body: "Perfect! See you at 6 PM. I'll arrive 30 minutes early to set up." },
    { senderId: user1.id, body: "Sounds great! Thank you!" },
  ];

  for (const msg of messages1) {
    await prisma.message.create({
      data: {
        conversationId: conv1.id,
        senderId: msg.senderId,
        body: msg.body,
        attachments: [],
      },
    });
  }

  const conv2 = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      bookingId: booking2.id,
      participants: {
        create: [
          { userId: user2.id },
          { userId: chefUser1.id },
        ],
      },
    },
  });

  const messages2 = [
    { senderId: user2.id, body: "Hello Chef Maria! Quick question about the menu." },
    { senderId: chefUser1.id, body: "Of course! What would you like to know?" },
    { senderId: user2.id, body: "Can we substitute the seafood course? One guest is allergic." },
    { senderId: chefUser1.id, body: "Absolutely! I can do a beautiful mushroom risotto instead. Would that work?" },
    { senderId: user2.id, body: "Perfect! That sounds delicious." },
    { senderId: chefUser1.id, body: "Great! I'll make note of that. Looking forward to cooking for you!" },
    { senderId: user2.id, body: "Thank you so much for being flexible!" },
    { senderId: chefUser1.id, body: "My pleasure! That's what I'm here for 😊" },
  ];

  for (const msg of messages2) {
    await prisma.message.create({
      data: {
        conversationId: conv2.id,
        senderId: msg.senderId,
        body: msg.body,
        attachments: [],
      },
    });
  }

  const conv3 = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      bookingId: booking3.id,
      participants: {
        create: [
          { userId: user1.id },
          { userId: chefUser2.id },
        ],
      },
    },
  });

  const messages3 = [
    { senderId: user1.id, body: "Hi James! We're having a big BBQ party and heard great things about you!" },
    { senderId: chefUser2.id, body: "Hey Alice! Thanks for reaching out! I'd love to help. Tell me about your event." },
    { senderId: user1.id, body: "It's for 12 people, outdoor setting in our garden. Mix of meats and some vegetarian options." },
    { senderId: chefUser2.id, body: "Sounds like a perfect day for BBQ! I can do ribs, burgers, grilled chicken, and some amazing veggie skewers." },
    { senderId: user1.id, body: "That sounds amazing! Let's book it!" },
    { senderId: chefUser2.id, body: "Awesome! I'll bring all the equipment. You just provide the space and the good vibes!" },
  ];

  for (const msg of messages3) {
    await prisma.message.create({
      data: {
        conversationId: conv3.id,
        senderId: msg.senderId,
        body: msg.body,
        attachments: [],
      },
    });
  }

  console.log('✓ Conversations and messages seeded');

  // Seed reviews with photos
  const review1 = await prisma.review.create({
    data: {
      bookingId: booking1.id,
      userId: user1.id,
      chefId: chef1.id,
      rating: 5,
      comment: "Maria exceeded all our expectations! The food was absolutely incredible - every dish was a masterpiece. Her pasta was perfectly al dente and the flavors were authentic and rich. She was professional, punctual, and even helped clean up afterwards. Our guests couldn't stop raving about the meal. Highly recommend!",
      photos: [
        '/images/reviews/alice-review1-photo1.jpg',
        '/images/reviews/alice-review1-photo2.jpg',
      ],
    },
  });

  const review2 = await prisma.review.create({
    data: {
      bookingId: booking2.id,
      userId: user2.id,
      chefId: chef1.id,
      rating: 4,
      comment: "Really enjoyed the evening! Maria's cooking is fantastic and she was very accommodating with our dietary restrictions. The mushroom risotto she made as a substitute was delicious. Only minor point - service was a bit rushed, but overall a great experience. Would book again!",
      photos: [
        '/images/reviews/bob-review1-photo1.jpg',
      ],
    },
  });

  const review3 = await prisma.review.create({
    data: {
      bookingId: booking3.id,
      userId: user1.id,
      chefId: chef2.id,
      rating: 5,
      comment: "James is a BBQ master! The brisket was so tender it melted in our mouths. The ribs were perfectly smoked with a beautiful bark. He even brought his own smoker and made the whole experience fun and interactive. Our backyard party was a huge success thanks to him!",
      photos: [
        '/images/reviews/alice-review2-photo1.jpg',
        '/images/reviews/alice-review2-photo2.jpg',
      ],
    },
  });

  console.log('✓ Reviews seeded');

  // Add chef replies to reviews
  await prisma.reviewReply.create({
    data: {
      reviewId: review1.id,
      authorId: chefUser1.id,
      body: "Thank you so much Alice! It was an absolute pleasure cooking for you and your guests. I'm thrilled that everyone enjoyed the meal. Looking forward to cooking for you again soon!",
    },
  });

  await prisma.reviewReply.create({
    data: {
      reviewId: review3.id,
      authorId: chefUser2.id,
      body: "Thanks Alice! That was such a fun party! Your backyard setup was perfect for BBQ. Can't wait to do it again sometime!",
    },
  });

  console.log('✓ Review replies seeded');

  // Update chef ratings
  const allReviewsForChef1 = await prisma.review.findMany({
    where: { chefId: chef1.id },
    select: { rating: true },
  });

  const avgRatingChef1 = allReviewsForChef1.reduce((sum, r) => sum + r.rating, 0) / allReviewsForChef1.length;

  await prisma.chefProfile.update({
    where: { id: chef1.id },
    data: {
      avgRating: Math.round(avgRatingChef1 * 10) / 10,
      reviewsCount: allReviewsForChef1.length,
    },
  });

  const allReviewsForChef2 = await prisma.review.findMany({
    where: { chefId: chef2.id },
    select: { rating: true },
  });

  const avgRatingChef2 = allReviewsForChef2.reduce((sum, r) => sum + r.rating, 0) / allReviewsForChef2.length;

  await prisma.chefProfile.update({
    where: { id: chef2.id },
    data: {
      avgRating: Math.round(avgRatingChef2 * 10) / 10,
      reviewsCount: allReviewsForChef2.length,
    },
  });

  console.log('✓ Chef ratings updated');

  // Seed notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: chefUser1.id,
        type: 'NEW_REVIEW',
        title: 'New Review Received',
        body: 'Alice Johnson gave you 5 stars',
        data: { reviewId: review1.id, rating: 5 },
        readAt: new Date(),
      },
      {
        userId: chefUser1.id,
        type: 'NEW_REVIEW',
        title: 'New Review Received',
        body: 'Bob Smith gave you 4 stars',
        data: { reviewId: review2.id, rating: 4 },
        readAt: null,
      },
      {
        userId: user1.id,
        type: 'REVIEW_REPLY',
        title: 'Chef Replied to Your Review',
        body: "Maria Garcia replied to your review",
        data: { reviewId: review1.id },
        readAt: null,
      },
      {
        userId: user1.id,
        type: 'NEW_MESSAGE',
        title: 'New message from Maria Garcia',
        body: 'Perfect! See you at 6 PM...',
        data: { conversationId: conv1.id },
        readAt: new Date(),
      },
      {
        userId: user2.id,
        type: 'NEW_MESSAGE',
        title: 'New message from Maria Garcia',
        body: 'My pleasure! That\'s what I\'m here for 😊',
        data: { conversationId: conv2.id },
        readAt: new Date(),
      },
      {
        userId: user1.id,
        type: 'NEW_MESSAGE',
        title: 'New message from James Wilson',
        body: 'Awesome! I\'ll bring all the equipment...',
        data: { conversationId: conv3.id },
        readAt: null,
      },
    ],
  });

  console.log('✓ Notifications seeded');

  console.log('Seeding finished successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
