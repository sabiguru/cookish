import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cookfort.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  // Static pages
  sitemap.push(
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/chefs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  );

  // Chef profiles
  try {
    const chefs = await prisma.chefProfile.findMany({
      where: {
        verified: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    chefs.forEach((chef) => {
      sitemap.push({
        url: `${BASE_URL}/chef/${chef.id}`,
        lastModified: chef.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } catch (error) {
    console.error('Error fetching chefs for sitemap:', error);
  }

  // Menus
  try {
    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    menus.forEach((menu) => {
      sitemap.push({
        url: `${BASE_URL}/menu/${menu.id}`,
        lastModified: menu.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error('Error fetching menus for sitemap:', error);
  }

  // Cuisines (if you have cuisine pages)
  try {
    const cuisines = await prisma.cuisine.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    cuisines.forEach((cuisine) => {
      sitemap.push({
        url: `${BASE_URL}/cuisine/${cuisine.slug}`,
        lastModified: cuisine.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error('Error fetching cuisines for sitemap:', error);
  }

  return sitemap;
}
