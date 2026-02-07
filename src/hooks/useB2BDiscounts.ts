import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CategoryDiscount {
  category_slug: string;
  discount_percent: number;
}

export function useB2BDiscounts() {
  const { user, b2bProfile } = useAuth();
  const [discounts, setDiscounts] = useState<CategoryDiscount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !b2bProfile) {
      setDiscounts([]);
      setLoading(false);
      return;
    }

    const fetchDiscounts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("b2b_category_discounts")
        .select(`
          discount_percent,
          category_id,
          product_categories!inner(slug)
        `)
        .eq("b2b_profile_id", b2bProfile.id);

      if (data) {
        const mapped = data.map((d: any) => ({
          category_slug: d.product_categories?.slug || "",
          discount_percent: d.discount_percent,
        }));
        setDiscounts(mapped);
      }
      setLoading(false);
    };

    fetchDiscounts();
  }, [user, b2bProfile]);

  const getDiscountForCategory = (categorySlug: string): number => {
    const found = discounts.find((d) => d.category_slug === categorySlug);
    return found?.discount_percent || 0;
  };

  return { discounts, loading, getDiscountForCategory };
}
