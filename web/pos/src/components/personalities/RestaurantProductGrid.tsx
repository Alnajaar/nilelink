// Restaurant Product Grid Component
// Category-based product display with modifiers, favorites, and quick ordering

import React, { useState, useEffect, useMemo } from 'react';
import { usePOSPersonality } from '../../lib/ui/AdaptivePOSPersonality';
import { productInventoryEngine, Product, ProductVariant } from '../../lib/core/ProductInventoryEngine';

interface RestaurantProductGridProps {
  onProductSelect: (product: Product, variant?: ProductVariant) => void;
  searchTerm?: string;
  selectedCategory?: string;
  className?: string;
}

const RestaurantProductGrid: React.FC<RestaurantProductGridProps> = ({
  onProductSelect,
  searchTerm = '',
  selectedCategory,
  className = ''
}) => {
  const { personality, posEngine } = usePOSPersonality();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Get products from inventory engine
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would filter by business ID
        const allProducts = productInventoryEngine.searchProducts({
          businessId: 'current_business', // TODO: Get from context
          limit: 100
        });
        setProducts(allProducts);

        // Extract unique categories
        const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
        setCategories(uniqueCategories);

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('pos_favorites');
        if (savedFavorites) {
          setFavorites(new Set(JSON.parse(savedFavorites)));
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [products, selectedCategory, searchTerm]);

  // Group products by category for display
  const groupedProducts = useMemo(() => {
    const grouped: { [category: string]: Product[] } = {};

    filteredProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });

    return grouped;
  }, [filteredProducts]);

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('pos_favorites', JSON.stringify([...newFavorites]));
  };

  const handleProductClick = (product: Product, variant?: ProductVariant) => {
    onProductSelect(product, variant);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 text-white ${className}`}>
      {/* Favorites Bar */}
      {favorites.size > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">FAVORITES</h3>
          <div className="grid grid-cols-4 gap-2">
            {Array.from(favorites).map(productId => {
              const product = products.find(p => p.id === productId);
              if (!product) return null;

              return (
                <button
                  key={productId}
                  onClick={() => handleProductClick(product)}
                  className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-left"
                >
                  <div className="text-sm font-medium truncate">{product.name}</div>
                  <div className="text-xs text-gray-400">${product.variants[0]?.price || 0}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories and Products */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category} className="mb-6">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wide">
                {category} ({categoryProducts.length})
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4">
              {categoryProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.has(product.id)}
                  onFavoriteToggle={() => toggleFavorite(product.id)}
                  onSelect={(variant) => handleProductClick(product, variant)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <p>No products found</p>
              <p className="text-sm">Try adjusting your search or category filter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Product Card Component
interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onSelect: (variant?: ProductVariant) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onFavoriteToggle,
  onSelect
}) => {
  const [showVariants, setShowVariants] = useState(false);

  const handleClick = () => {
    if (product.variants.length > 1) {
      setShowVariants(!showVariants);
    } else {
      onSelect(product.variants[0]);
    }
  };

  const primaryVariant = product.variants[0];
  const hasModifiers = product.type === 'variable' || product.tags.includes('modifiers');

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-all duration-200 text-left group"
      >
        {/* Product Image */}
        {product.images[0] && (
          <div className="w-full h-20 bg-gray-700 rounded mb-2 overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Product Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-medium text-sm leading-tight">{product.name}</h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className={`text-lg ${isFavorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-orange-400 font-semibold">
              ${primaryVariant?.price || 0}
            </span>

            <div className="flex items-center space-x-1">
              {hasModifiers && <span className="text-xs bg-blue-500 text-white px-1 rounded">⚙️</span>}
              {product.tags.includes('popular') && <span className="text-xs bg-green-500 text-white px-1 rounded">🔥</span>}
              {product.tags.includes('spicy') && <span className="text-xs bg-red-500 text-white px-1 rounded">🌶️</span>}
            </div>
          </div>
        </div>
      </button>

      {/* Variants Dropdown */}
      {showVariants && product.variants.length > 1 && (
        <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-b-lg shadow-lg z-10">
          {product.variants.map((variant, index) => (
            <button
              key={variant.id}
              onClick={() => {
                onSelect(variant);
                setShowVariants(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 first:rounded-b-none last:rounded-b-lg border-t border-gray-600 first:border-t-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{variant.name}</span>
                <span className="text-orange-400 font-medium">${variant.price}</span>
              </div>
              {variant.attributes.size && (
                <span className="text-xs text-gray-400">{variant.attributes.size}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantProductGrid;