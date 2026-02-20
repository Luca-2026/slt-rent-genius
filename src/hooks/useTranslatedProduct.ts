import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Product, ProductCategory } from "@/data/rentalData";
import {
  productTranslations,
  categoryTranslations,
  specKeyTranslations,
  specValueTranslations,
  tagTranslations,
} from "@/i18n/productTranslations";

/**
 * Returns a translated copy of a Product based on the current language.
 * German is the source language stored in the data files, so translations
 * are only applied when the active language is NOT "de".
 */
export function useTranslatedProduct(product: Product | null | undefined): Product | null {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    if (!product) return null;
    if (lang === "de") return product;

    const tr = productTranslations[product.id];

    // Translate specifications keys AND values
    let translatedSpecs: Record<string, string> | undefined;
    if (product.specifications) {
      translatedSpecs = {};
      for (const [key, value] of Object.entries(product.specifications)) {
        const translatedKey = specKeyTranslations[key] || key;
        const translatedValue = specValueTranslations[value] || value;
        translatedSpecs[translatedKey] = translatedValue;
      }
    }

    // Translate tags
    let translatedTags: string[] | undefined;
    if (product.tags) {
      translatedTags = product.tags.map((tag) => tagTranslations[tag] || tag);
    }

    return {
      ...product,
      name: tr?.name || product.name,
      description: tr?.description || product.description,
      detailedDescription: tr?.detailedDescription || product.detailedDescription,
      specifications: translatedSpecs || product.specifications,
      tags: translatedTags || product.tags,
    };
  }, [product, lang]);
}

/**
 * Returns translated copies of an array of Products.
 */
export function useTranslatedProducts(products: Product[]): Product[] {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    if (lang === "de") return products;

    return products.map((product) => {
      const tr = productTranslations[product.id];

      let translatedSpecs: Record<string, string> | undefined;
      if (product.specifications) {
        translatedSpecs = {};
        for (const [key, value] of Object.entries(product.specifications)) {
          const translatedKey = specKeyTranslations[key] || key;
          const translatedValue = specValueTranslations[value] || value;
          translatedSpecs[translatedKey] = translatedValue;
        }
      }

      let translatedTags: string[] | undefined;
      if (product.tags) {
        translatedTags = product.tags.map((tag) => tagTranslations[tag] || tag);
      }

      return {
        ...product,
        name: tr?.name || product.name,
        description: tr?.description || product.description,
        detailedDescription: tr?.detailedDescription || product.detailedDescription,
        specifications: translatedSpecs || product.specifications,
        tags: translatedTags || product.tags,
      };
    });
  }, [products, lang]);
}

/**
 * Returns a translated copy of a ProductCategory.
 */
export function useTranslatedCategory(category: ProductCategory | null | undefined): ProductCategory | null {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    if (!category) return null;
    if (lang === "de") return category;

    const tr = categoryTranslations[category.id];
    if (!tr) return category;

    return {
      ...category,
      title: tr.title || category.title,
      description: tr.description || category.description,
    };
  }, [category, lang]);
}

/**
 * Returns translated copies of an array of ProductCategories.
 */
export function useTranslatedCategories(categories: ProductCategory[]): ProductCategory[] {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    if (lang === "de") return categories;

    return categories.map((category) => {
      const tr = categoryTranslations[category.id];
      if (!tr) return category;
      return {
        ...category,
        title: tr.title || category.title,
        description: tr.description || category.description,
      };
    });
  }, [categories, lang]);
}
