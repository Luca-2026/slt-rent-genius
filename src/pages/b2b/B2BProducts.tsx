import { useState, useMemo } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { B2BProductCard } from "@/components/b2b/B2BProductCard";
import { B2BReservationDialog } from "@/components/b2b/B2BReservationDialog";
import { useB2BDiscounts } from "@/hooks/useB2BDiscounts";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  locations,
  productCategories,
  getCategoriesForLocation,
  getProductsForLocationCategory,
  Product,
} from "@/data/rentalData";
import { locationData } from "@/data/locationData";
import { Search, MapPin, Percent, CreditCard, Phone, Mail, Package } from "lucide-react";

export default function B2BProducts() {
  const { b2bProfile } = useAuth();
  const { getDiscountForCategory, loading: discountsLoading } = useB2BDiscounts();

  // State
  const [selectedLocation, setSelectedLocation] = useState(
    b2bProfile?.assigned_location || "krefeld"
  );
  const [selectedCategory, setSelectedCategory] = useState("alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [inquiryCategory, setInquiryCategory] = useState("");

  // Available categories for selected location
  const availableCategories = useMemo(
    () => getCategoriesForLocation(selectedLocation),
    [selectedLocation]
  );

  // Products filtered by location, category, and search
  const filteredProducts = useMemo(() => {
    let products = getProductsForLocationCategory(selectedLocation, selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    return products;
  }, [selectedLocation, selectedCategory, searchQuery]);

  // Find category slug for a product (for discount lookup)
  const getCategoryForProduct = (product: Product): string => {
    if (selectedCategory !== "alle") return selectedCategory;
    // Try to find which category this product belongs to
    const location = locations.find((l) => l.id === selectedLocation);
    if (!location) return "";
    for (const [catId, prods] of Object.entries(location.products)) {
      if (prods.some((p) => p.id === product.id)) return catId;
    }
    return "";
  };

  // Credit limit info
  const creditLimit = b2bProfile?.credit_limit || 0;
  const usedCredit = b2bProfile?.used_credit || 0;
  const availableCredit = creditLimit - usedCredit;
  const creditUsagePercent = creditLimit > 0 ? (usedCredit / creditLimit) * 100 : 0;

  // Assigned contact person
  const assignedLoc = locationData.find((l) => l.id === b2bProfile?.assigned_location);
  const contactPerson = b2bProfile?.assigned_contact_override 
    ? b2bProfile.assigned_contact_override 
    : assignedLoc?.manager;

  const handleInquiry = (product: Product) => {
    const catSlug = getCategoryForProduct(product);
    setInquiryProduct(product);
    setInquiryCategory(catSlug);
  };

  return (
    <B2BPortalLayout
      title="Produkte & Anfragen"
      subtitle={`${filteredProducts.length} Produkte verfügbar`}
    >
      {/* Top info bar: Credit + Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Credit Limit Card */}
        {creditLimit > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-headline">Kreditlimit</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-headline">
                  {availableCredit.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                </span>
                <span className="text-xs text-muted-foreground">
                  von {creditLimit.toLocaleString("de-DE", { style: "currency", currency: "EUR" })} verfügbar
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    creditUsagePercent > 80 ? "bg-destructive" : creditUsagePercent > 50 ? "bg-yellow-500" : "bg-accent"
                  }`}
                  style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Person */}
        {contactPerson && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-headline">Ihr Ansprechpartner</span>
              </div>
              <p className="font-medium text-headline text-sm">
                {(contactPerson as any).name}
              </p>
              <p className="text-xs text-muted-foreground">{(contactPerson as any).role || "Standortleiter"}</p>
              <div className="flex gap-3 mt-2">
                {assignedLoc && (
                  <a href={`tel:${assignedLoc.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {assignedLoc.phone}
                  </a>
                )}
                <a href={`mailto:${(contactPerson as any).email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  E-Mail
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Location */}
        <Select value={selectedLocation} onValueChange={(v) => { setSelectedLocation(v); setSelectedCategory("alle"); }}>
          <SelectTrigger className="w-full sm:w-48">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Produkt suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-2 px-2">
        {availableCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const discount = cat.id !== "alle" ? getDiscountForCategory(cat.id) : 0;
          return (
            <Button
              key={cat.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.title}
              {discount > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs bg-accent/20 text-accent">
                  -{discount}%
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchQuery
              ? `Keine Produkte für "${searchQuery}" gefunden.`
              : "Keine Produkte in dieser Kategorie verfügbar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => {
            const catSlug = getCategoryForProduct(product);
            const discount = getDiscountForCategory(catSlug);
            return (
              <B2BProductCard
                key={product.id}
                product={product}
                categorySlug={catSlug}
                discountPercent={discount}
                onInquiry={handleInquiry}
              />
            );
          })}
        </div>
      )}

      {/* Reservation Dialog */}
      <B2BReservationDialog
        product={inquiryProduct}
        categorySlug={inquiryCategory}
        discountPercent={inquiryCategory ? getDiscountForCategory(inquiryCategory) : 0}
        open={!!inquiryProduct}
        onOpenChange={(open) => !open && setInquiryProduct(null)}
        preselectedLocation={selectedLocation}
      />
    </B2BPortalLayout>
  );
}
