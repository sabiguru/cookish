import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cookfort.com';
const SITE_NAME = 'CookFort';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

interface GenerateMetadataParams {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

/**
 * Generate comprehensive metadata for SEO
 * Includes OpenGraph, Twitter Cards, and basic meta tags
 */
export function generateSEOMetadata(params: GenerateMetadataParams): Metadata {
  const {
    title,
    description,
    path,
    image = DEFAULT_IMAGE,
    noIndex = false,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
  } = params;

  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    applicationName: SITE_NAME,
    authors: authors?.map((name) => ({ name })),
    keywords: [
      'chef booking',
      'private chef',
      'catering',
      'event catering',
      'personal chef',
      'hire chef',
    ],
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      type,
      locale: 'en_GB',
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@cookfort',
      site: '@cookfort',
    },
    alternates: {
      canonical: url,
      languages: {
        'en-GB': url,
        'fr-FR': `${BASE_URL}/fr${path}`,
        'yo-NG': `${BASE_URL}/yo${path}`,
      },
    },
  };

  return metadata;
}

/**
 * Generate metadata for chef profile pages
 */
export function generateChefMetadata(params: {
  chefId: string;
  name: string;
  bio?: string;
  image?: string;
  cuisines?: string[];
  avgRating?: number;
  reviewCount?: number;
}): Metadata {
  const { name, bio, image, cuisines, avgRating, reviewCount } = params;

  const cuisineText = cuisines && cuisines.length > 0 ? cuisines.join(', ') : '';
  const ratingText =
    avgRating && reviewCount
      ? ` • ${avgRating.toFixed(1)}★ (${reviewCount} reviews)`
      : '';

  const description =
    bio ||
    `Book ${name}, professional chef specializing in ${cuisineText}${ratingText}. Browse menus and book for your next event.`;

  return generateSEOMetadata({
    title: `${name} - Private Chef`,
    description: description.substring(0, 160),
    path: `/chef/${params.chefId}`,
    image,
    type: 'profile',
  });
}

/**
 * Generate metadata for menu pages
 */
export function generateMenuMetadata(params: {
  menuId: string;
  title: string;
  description?: string;
  chefName: string;
  pricePerPerson?: number;
  image?: string;
}): Metadata {
  const { title, description, chefName, pricePerPerson } = params;

  const priceText = pricePerPerson ? ` • £${pricePerPerson}/person` : '';
  const desc =
    description ||
    `${title} by ${chefName}${priceText}. Book this menu for your next event.`;

  return generateSEOMetadata({
    title: `${title} by ${chefName}`,
    description: desc.substring(0, 160),
    path: `/menu/${params.menuId}`,
    image: params.image,
  });
}

/**
 * Generate metadata for cuisine listing pages
 */
export function generateCuisineMetadata(params: {
  cuisineName: string;
  slug: string;
  chefCount?: number;
}): Metadata {
  const { cuisineName, chefCount } = params;

  const countText = chefCount ? ` ${chefCount}` : '';
  const description = `Browse${countText} professional ${cuisineName} chefs. Book for your next event. Read reviews, view menus, and hire top culinary talent.`;

  return generateSEOMetadata({
    title: `${cuisineName} Chefs for Hire`,
    description,
    path: `/cuisine/${params.slug}`,
  });
}
