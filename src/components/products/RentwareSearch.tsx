import { useEffect, useRef, useState } from "react";

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
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Force re-render when config changes
    setKey(prev => prev + 1);
  }, [config.showOnlyTags]);

  useEffect(() => {
    if (containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Create new rtr-search element
      const searchElement = document.createElement('rtr-search');
      
      // Set all attributes
      searchElement.setAttribute('view', config.view || 'cards');
      searchElement.setAttribute('show-location', config.showLocation || 'on');
      searchElement.setAttribute('load-behaviour', config.loadBehaviour || 'extended');
      
      if (config.locations) {
        searchElement.setAttribute('locations', config.locations);
      }
      if (config.showOnlyTags) {
        searchElement.setAttribute('show-only-tags', config.showOnlyTags);
      }
      
      containerRef.current.appendChild(searchElement);
    }
  }, [config, categoryId, key]);

  return (
    <div 
      ref={containerRef} 
      key={`rentware-search-${categoryId}-${key}`}
      id={`rentware-search-${categoryId}`} 
      className="min-h-[500px]" 
    />
  );
}
