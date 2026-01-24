import { useEffect, useRef } from "react";

interface RentwareSearchConfig {
  view?: string;
  showLocation?: string;
  loadBehaviour?: string;
  locations?: string;
  showOnlyTags?: string;
}

interface RentwareSearchProps {
  config: RentwareSearchConfig;
  categoryId: string;
}

export function RentwareSearch({ config, categoryId }: RentwareSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const searchElement = document.createElement('rtr-search');
      
      if (config.view) {
        searchElement.setAttribute('view', config.view);
      }
      if (config.showLocation) {
        searchElement.setAttribute('show-location', config.showLocation);
      }
      if (config.loadBehaviour) {
        searchElement.setAttribute('load-behaviour', config.loadBehaviour);
      }
      if (config.locations) {
        searchElement.setAttribute('locations', config.locations);
      }
      if (config.showOnlyTags) {
        searchElement.setAttribute('show-only-tags', config.showOnlyTags);
      }
      
      containerRef.current.appendChild(searchElement);
    }
  }, [config, categoryId]);

  return (
    <div 
      ref={containerRef} 
      id={`rentware-search-${categoryId}`} 
      className="min-h-[500px]" 
    />
  );
}
