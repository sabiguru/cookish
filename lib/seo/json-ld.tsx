/**
 * JSON-LD structured data helpers for SEO
 * Implements schema.org types for better search engine visibility
 */

export interface WebSiteJsonLd {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface LocalBusinessJsonLd {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  image?: string;
  url: string;
  telephone?: string;
  email?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  priceRange?: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  servesCuisine?: string[];
}

export interface MenuJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Menu';
  name: string;
  description?: string;
  hasMenuSection?: Array<{
    '@type': 'MenuSection';
    name?: string;
    hasMenuItem: Array<{
      '@type': 'MenuItem';
      name: string;
      description?: string;
      offers?: {
        '@type': 'Offer';
        price: number;
        priceCurrency: string;
      };
      suitableForDiet?: string[];
    }>;
  }>;
}

export interface ItemListJsonLd {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    url: string;
    name: string;
    image?: string;
  }>;
}

export interface PersonJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  image?: string;
  jobTitle?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  url?: string;
  sameAs?: string[];
}

export interface ReviewJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Review';
  author: {
    '@type': 'Person';
    name: string;
  };
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviewBody?: string;
  datePublished: string;
  itemReviewed: {
    '@type': 'Service' | 'LocalBusiness';
    name: string;
  };
}

/**
 * Generate WebSite JSON-LD for homepage
 */
export function generateWebSiteJsonLd(baseUrl: string): WebSiteJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CookFort',
    url: baseUrl,
    description: 'Book professional chefs for your events. Browse menus, read reviews, and hire top culinary talent.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate LocalBusiness JSON-LD for chef profile
 */
export function generateChefJsonLd(params: {
  chefId: string;
  name: string;
  image?: string;
  url: string;
  cuisines?: string[];
  avgRating?: number;
  reviewCount?: number;
  priceRange?: string;
}): LocalBusinessJsonLd {
  const jsonLd: LocalBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: params.name,
    url: params.url,
  };

  if (params.image) {
    jsonLd.image = params.image;
  }

  if (params.cuisines && params.cuisines.length > 0) {
    jsonLd.servesCuisine = params.cuisines;
  }

  if (params.avgRating && params.reviewCount && params.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: params.avgRating,
      reviewCount: params.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (params.priceRange) {
    jsonLd.priceRange = params.priceRange;
  }

  return jsonLd;
}

/**
 * Generate Menu JSON-LD for menu page
 */
export function generateMenuJsonLd(params: {
  name: string;
  description?: string;
  items: Array<{
    name: string;
    description?: string;
    price?: number;
    dietaryTags?: string[];
  }>;
}): MenuJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: params.name,
    description: params.description,
    hasMenuSection: [
      {
        '@type': 'MenuSection',
        hasMenuItem: params.items.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          ...(item.price && {
            offers: {
              '@type': 'Offer',
              price: item.price,
              priceCurrency: 'GBP',
            },
          }),
          ...(item.dietaryTags &&
            item.dietaryTags.length > 0 && {
              suitableForDiet: item.dietaryTags,
            }),
        })),
      },
    ],
  };
}

/**
 * Generate ItemList JSON-LD for chef listing pages
 */
export function generateChefListJsonLd(params: {
  chefs: Array<{
    id: string;
    name: string;
    image?: string;
    url: string;
  }>;
}): ItemListJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: params.chefs.map((chef, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: chef.url,
      name: chef.name,
      ...(chef.image && { image: chef.image }),
    })),
  };
}

/**
 * Render JSON-LD script tag
 */
export function renderJsonLd(data: any): JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}
