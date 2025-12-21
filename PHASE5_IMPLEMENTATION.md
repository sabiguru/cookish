# Phase 5 Implementation - Complete Documentation

## Overview

This document provides comprehensive documentation for the Phase 5 implementation of the CookFort platform, which includes Real-Time Messaging, Reviews & Ratings, SEO Infrastructure, and i18n support.

**Implementation Date:** October 2025
**Status:** ✅ Complete

---

## Table of Contents

1. [Real-Time Messaging System](#1-real-time-messaging-system)
2. [Reviews & Ratings System](#2-reviews--ratings-system)
3. [SEO Infrastructure](#3-seo-infrastructure)
4. [Internationalization (i18n)](#4-internationalization-i18n)
5. [Seed Data](#5-seed-data)
6. [Testing](#6-testing)
7. [Usage Guide](#7-usage-guide)
8. [API Reference](#8-api-reference)

---

## 1. Real-Time Messaging System

### Features

✅ **Real-time messaging** via Server-Sent Events (SSE)
✅ **Rate limiting** (10 messages per 30 seconds per conversation)
✅ **Attachment support** (images jpg/png/webp and PDFs, max 10MB, up to 4 per message)
✅ **Read receipts** with timestamps
✅ **Typing indicators**
✅ **Access control** (participants only, admin/staff read-only for booking conversations)
✅ **Email notifications** for new messages
✅ **Activity logging** for all mutations

### Architecture

**API Routes:**
- `POST /api/messages` - List and create conversations
- `GET /api/messages/[conversationId]` - Fetch messages with pagination
- `POST /api/messages/[conversationId]` - Send a message
- `POST /api/messages/[conversationId]/read` - Mark messages as read
- `POST /api/messages/[conversationId]/typing` - Send typing indicator
- `GET /api/messages/events` - SSE stream for real-time updates

**UI Components:**
- `ConversationList` - Display conversations with unread counts
- `ChatThread` - Display messages with read receipts
- `MessageInput` - Send messages and attachments

**Pages:**
- `/messages` - Main inbox page
- `/messages/[conversationId]` - Individual conversation thread

### Key Implementation Details

**SSE Manager:**
```typescript
// Location: app/api/messages/events/route.ts
class SSEManager {
  addConnection(userId, controller)
  removeConnection(userId, controller)
  broadcast(userId, event, data)
  getConnectionCount(userId)
}
```

**Rate Limiting:**
```typescript
// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
// 10 messages per 30 seconds per conversation
```

**Attachment Validation:**
```typescript
// Allowed types: jpg, png, webp, pdf
// Max size: 10MB
// Max count: 4 per message
```

---

## 2. Reviews & Ratings System

### Features

✅ **Post-booking reviews** (only after COMPLETED status)
✅ **One review per booking** (unique constraint)
✅ **Rating 1-5 stars** with mandatory comment for ≤3 stars
✅ **Up to 4 photos** per review
✅ **Chef reply capability** (one reply per review)
✅ **Denormalized rating aggregation** (avgRating, reviewsCount on ChefProfile)
✅ **Rating distribution** display
✅ **"Verified booking" badge**
✅ **Email notifications** for reviews and replies
✅ **Activity logging**

### Architecture

**API Routes:**
- `POST /api/reviews` - Create a review
- `GET /api/reviews?chefId=xxx` - Fetch reviews for a chef
- `POST /api/reviews/[reviewId]/reply` - Chef reply to review
- `DELETE /api/reviews/[reviewId]/reply` - Delete chef reply
- `GET /api/reviews/stats?chefId=xxx` - Get rating statistics

**UI Components:**
- `StarRating` - Interactive star rating component
- `ReviewForm` - Submit reviews with photos
- `ReviewList` - Display reviews with chef replies
- `RatingBreakdown` - Rating distribution chart

**Database Schema:**
```prisma
model Review {
  id        String   @id @default(cuid())
  bookingId String   @unique
  userId    String
  chefId    String
  rating    Int
  comment   String?
  photos    String[]
  createdAt DateTime @default(now())

  reply     ReviewReply?
}

model ReviewReply {
  id        String   @id @default(cuid())
  reviewId  String   @unique
  authorId  String
  body      String
  createdAt DateTime @default(now())
}

model ChefProfile {
  avgRating    Float? @default(0)
  reviewsCount Int    @default(0)
}
```

### Key Implementation Details

**Rating Aggregation:**
```typescript
// Automatically updates ChefProfile on review creation
const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
await prisma.chefProfile.update({
  data: {
    avgRating: Math.round(avgRating * 10) / 10,
    reviewsCount: reviews.length,
  },
});
```

**Comment Validation:**
```typescript
// Required for ratings <= 3 stars
CreateReviewSchema.refine((data) => {
  if (data.rating <= 3 && !data.comment?.trim()) {
    return false;
  }
  return true;
});
```

---

## 3. SEO Infrastructure

### Features

✅ **JSON-LD structured data** (WebSite, LocalBusiness, Menu, ItemList)
✅ **Dynamic sitemap** with chef profiles, menus, and cuisines
✅ **Robots.txt** configuration
✅ **OpenGraph and Twitter Card** metadata
✅ **generateMetadata()** for all public pages

### Architecture

**SEO Helpers:**
- `lib/seo/json-ld.ts` - JSON-LD structured data generators
- `lib/seo/metadata.ts` - OpenGraph and metadata generators
- `app/sitemap.ts` - Dynamic sitemap generation
- `app/robots.ts` - Robots.txt configuration

### Key Implementation Details

**JSON-LD for Chef Profile:**
```typescript
generateChefJsonLd({
  chefId: chef.id,
  name: chef.name,
  image: chef.image,
  cuisines: ['Italian', 'Mediterranean'],
  avgRating: 4.5,
  reviewCount: 12,
  priceRange: '££',
});
```

**Sitemap Generation:**
```typescript
// Automatically includes:
// - Static pages (home, chefs, about, contact)
// - All verified chef profiles
// - All active menus
// - All cuisine pages
```

**Metadata Example:**
```typescript
export function generateMetadata({ params }) {
  return generateSEOMetadata({
    title: `${chef.name} - Private Chef`,
    description: chef.bio,
    path: `/chef/${chef.id}`,
    image: chef.image,
    type: 'profile',
  });
}
```

---

## 4. Internationalization (i18n)

### Features

✅ **Multi-locale support** (en, fr, yo)
✅ **Language switcher** component
✅ **Translated static strings**
✅ **Locale detection** from URL
✅ **SEO-friendly** locale routing

### Architecture

**Dictionaries:**
- `lib/i18n/dictionaries/en.json` - English translations
- `lib/i18n/dictionaries/fr.json` - French translations
- `lib/i18n/dictionaries/yo.json` - Yoruba translations

**Utilities:**
- `lib/i18n/index.ts` - i18n helper functions
- `components/LanguageSwitcher.tsx` - Language switcher UI

### Key Implementation Details

**Usage in Components:**
```typescript
import { getDictionary, t } from '@/lib/i18n';

const dict = getDictionary(locale);
const welcomeText = t(dict, 'common.welcome'); // "Welcome"
const homeText = t(dict, 'nav.home'); // "Home"
```

**URL Structure:**
```
/chefs          -> English (default)
/fr/chefs       -> French
/yo/chefs       -> Yoruba
```

**Supported Locales:**
- `en` 🇬🇧 English
- `fr` 🇫🇷 Français
- `yo` 🇳🇬 Yorùbá

---

## 5. Seed Data

### What's Included

✅ **2 regular users** (Alice Johnson, Bob Smith)
✅ **2 chefs** (Maria Garcia - Italian, James Wilson - BBQ)
✅ **3 completed bookings**
✅ **3 conversations** with 5-8 messages each
✅ **2 reviews** with photos
✅ **1 chef reply**
✅ **6 notifications**

### Running Seed Data

```bash
cd cookish
npx prisma db seed
```

### Seed Data Overview

**Users:**
- alice@example.com (customer)
- bob@example.com (customer)
- chef.maria@example.com (Italian chef, 4.5★ avg rating)
- chef.james@example.com (BBQ chef)

**Conversations:**
1. Alice ↔ Maria (5 messages, about dinner party)
2. Bob ↔ Maria (8 messages, about dietary restrictions)
3. Alice ↔ James (6 messages, about BBQ party)

**Reviews:**
1. Alice → Maria (5★ with 2 photos + chef reply)
2. Bob → Maria (4★ with 1 photo)

---

## 6. Testing

### Test Coverage

✅ **Message validators** (30+ test cases)
✅ **Review validators** (25+ test cases)
✅ **i18n utilities** (20+ test cases)

### Running Tests

```bash
npm test
```

### Test Files

- `__tests__/validators/message.test.ts`
- `__tests__/validators/review.test.ts`
- `__tests__/lib/i18n.test.ts`

### Test Coverage Highlights

**Message Validators:**
- Conversation creation validation
- Message body and attachment validation
- File type and size validation
- Sanitization tests

**Review Validators:**
- Rating range validation
- Comment requirement for low ratings
- Photo limit validation
- Reply validation
- Rating statistics calculation

**i18n Utilities:**
- Locale detection from paths
- Path manipulation (add/strip locale)
- Translation key lookup
- Parameter interpolation

---

## 7. Usage Guide

### Sending a Message

```typescript
// Client-side
const response = await fetch(`/api/messages/${conversationId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    body: 'Hello!',
    attachments: [
      {
        url: 'https://example.com/photo.jpg',
        filename: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      },
    ],
  }),
});
```

### Creating a Review

```typescript
// Client-side
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingId: 'booking123',
    rating: 5,
    comment: 'Amazing experience!',
    photos: ['https://example.com/photo1.jpg'],
  }),
});
```

### Using SSE for Real-time Updates

```typescript
// Client-side
const eventSource = new EventSource('/api/messages/events');

eventSource.addEventListener('new_message', (e) => {
  const data = JSON.parse(e.data);
  // Update UI with new message
});

eventSource.addEventListener('typing', (e) => {
  const data = JSON.parse(e.data);
  // Show typing indicator
});
```

### Using i18n

```typescript
// Server component
import { getDictionary, t } from '@/lib/i18n';

const dict = getDictionary('fr');
const title = t(dict, 'hero.title'); // "Réservez des Chefs Professionnels"
```

---

## 8. API Reference

### Messaging Endpoints

#### `POST /api/messages`
Create a new conversation.

**Request Body:**
```json
{
  "type": "DIRECT",
  "participantIds": ["user1", "user2"],
  "bookingId": "optional-booking-id",
  "initialMessage": "Optional initial message"
}
```

#### `GET /api/messages`
List all conversations for authenticated user.

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv123",
      "type": "DIRECT",
      "unreadCount": 2,
      "lastMessage": { ... },
      "participants": [ ... ]
    }
  ]
}
```

#### `POST /api/messages/[conversationId]`
Send a message to a conversation.

**Request Body:**
```json
{
  "body": "Message text",
  "attachments": [
    {
      "url": "https://example.com/file.jpg",
      "filename": "file.jpg",
      "mimetype": "image/jpeg",
      "size": 1024
    }
  ]
}
```

**Rate Limit:** 10 messages per 30 seconds

### Review Endpoints

#### `POST /api/reviews`
Create a review for a completed booking.

**Request Body:**
```json
{
  "bookingId": "booking123",
  "rating": 5,
  "comment": "Optional comment (required for rating <= 3)",
  "photos": ["https://example.com/photo1.jpg"]
}
```

#### `GET /api/reviews?chefId=xxx`
Fetch reviews for a chef.

**Query Parameters:**
- `chefId` (required)
- `limit` (optional, default: 20)
- `cursor` (optional, for pagination)

#### `POST /api/reviews/[reviewId]/reply`
Chef reply to a review.

**Request Body:**
```json
{
  "body": "Thank you for your feedback!"
}
```

**Requirements:**
- Min 10 characters
- Max 1000 characters
- One reply per review

---

## Security Considerations

### Messaging
- ✅ Participant-only access control
- ✅ Admin/staff read-only for booking conversations
- ✅ Rate limiting to prevent spam
- ✅ Message body sanitization (XSS prevention)
- ✅ Attachment validation (type and size)

### Reviews
- ✅ Post-booking only (COMPLETED status required)
- ✅ One review per booking (database constraint)
- ✅ Text sanitization
- ✅ Profanity filter stub (ready for implementation)
- ✅ Photo URL validation

### General
- ✅ Activity logging for all mutations
- ✅ Email notifications with proper templates
- ✅ Authentication required for all endpoints
- ✅ Input validation with Zod schemas

---

## Performance Optimizations

1. **Denormalized Rating Data** - avgRating and reviewsCount stored on ChefProfile for fast queries
2. **Cursor-based Pagination** - Efficient pagination for messages and reviews
3. **SSE for Real-time** - Lightweight alternative to WebSockets
4. **In-memory Rate Limiting** - Fast rate limit checks
5. **Database Indexes** - Proper indexing on frequently queried fields

---

## Future Enhancements

### Short-term
- [ ] Integrate actual file storage (MinIO/S3) for attachments
- [ ] Implement chat drawer for booking pages
- [ ] Add push notifications
- [ ] Implement profanity filter

### Long-term
- [ ] Migrate from SSE to WebSockets for better scalability
- [ ] Add message search functionality
- [ ] Implement message reactions/emojis
- [ ] Add voice message support
- [ ] Implement review moderation queue

---

## Troubleshooting

### Common Issues

**Messages not appearing in real-time:**
- Check if SSE connection is established (`/api/messages/events`)
- Verify browser supports Server-Sent Events
- Check network tab for SSE stream

**Review creation fails:**
- Verify booking status is COMPLETED
- Check if review already exists for booking
- Ensure comment is provided for ratings ≤ 3 stars

**Language switcher not working:**
- Verify locale is in supported list (en, fr, yo)
- Check URL structure (`/[locale]/path`)
- Ensure dictionaries are properly imported

---

## Credits

**Implementation:** Phase 5 Development Team
**Technologies:** Next.js 14, Prisma, TypeScript, Tailwind CSS, shadcn/ui
**Date:** October 2025

---

## License

Copyright © 2025 CookFort. All rights reserved.
