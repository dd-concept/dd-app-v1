import { StockItem, Order, OrderItem, SizeAvailability, ItemPhoto } from './types';

// Mock data for fallback when API is unavailable - legacy format
export const MOCK_STOCK: StockItem[] = [
  {
    "sku": "TS001-BLK",
    "item_name": "Basic T-Shirt",
    "color_code": "BLK",
    "brand": "FashionBrand",
    "description": "Original SKU: TS001-BLK",
    "price_rub": 500.0,
    "sizes": [
      { "size": "M", "quantity": 2 },
      { "size": "L", "quantity": 2 }
    ],
    "photos": [
      { "photo_url": "https://example.com/photos/ts001_front.jpg", "photo_category": "front" },
      { "photo_url": "https://example.com/photos/ts001_side.jpg", "photo_category": "side" }
    ]
  },
  {
    "sku": "JN002-BLU",
    "item_name": "Slim Jeans",
    "color_code": "BLU",
    "brand": "DenimCo",
    "description": "Original SKU: JN002-BLU",
    "price_rub": 1200.0,
    "sizes": [
      { "size": "32", "quantity": 2 }
    ],
    "photos": [
      { "photo_url": "https://example.com/photos/jn002_front.jpg", "photo_category": "front" }
    ]
  },
  {
    "sku": "SW003-RED",
    "item_name": "Wool Sweater",
    "color_code": "RED",
    "brand": "WinterWear",
    "description": "Original SKU: SW003-RED",
    "price_rub": 1500.0,
    "sizes": [
      { "size": "S", "quantity": 1 },
      { "size": "M", "quantity": 3 }
    ],
    "photos": [
      { "photo_url": "https://example.com/photos/sw003_front.jpg", "photo_category": "front" }
    ]
  }
];

// Mock products with proper structure for new API
export const MOCK_PRODUCTS: StockItem[] = [
  {
    "sku": "TS001-BLK",
    "item_name": "Basic T-Shirt",
    "color_code": "BLK",
    "brand": "FashionBrand",
    "description": "Original SKU: TS001-BLK",
    "price_rub": 500.0,
    "sizes": [
      { "size": "M", "quantity": 2 },
      { "size": "L", "quantity": 2 }
    ],
    "photos": [
      { "photo_url": "https://example.com/photos/ts001_front.jpg", "photo_category": "front" },
      { "photo_url": "https://example.com/photos/ts001_side.jpg", "photo_category": "side" }
    ]
  },
  {
    "sku": "JN002-BLU",
    "item_name": "Slim Jeans",
    "color_code": "BLU",
    "brand": "DenimCo",
    "description": "Original SKU: JN002-BLU",
    "price_rub": 1200.0,
    "sizes": [
      { "size": "32", "quantity": 2 }
    ],
    "photos": [
      { "photo_url": "https://example.com/photos/jn002_front.jpg", "photo_category": "front" }
    ]
  },
  {
    "sku": "SW003-RED",
    "item_name": "Wool Sweater",
    "color_code": "RED",
    "brand": "WinterWear",
    "description": "Original SKU: SW003-RED",
    "price_rub": 1500.0,
    "sizes": [
      { "size": "S", "quantity": 1 },
      { "size": "M", "quantity": 3 }
    ],
    "photos": [
      { "photo_url": "https://example.com/photos/sw003_front.jpg", "photo_category": "front" }
    ]
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    order_id: 1,
    created_at: '2023-02-20T00:00:00',
    prepay_amount: '1500.0',
    status: 'paid',
    items: [
      { 
        sku: 'SW003-RED', 
        item_name: 'Wool Sweater', 
        size: 'M', 
        price_cny: '150.0',
        price_rub: '1500.0' 
      }
    ]
  },
  {
    order_id: 2,
    created_at: '2023-05-15T00:00:00',
    prepay_amount: '1700.0',
    status: 'pending',
    items: [
      { 
        sku: 'TS001-BLK', 
        item_name: 'Basic T-Shirt', 
        size: 'L', 
        price_cny: '50.0',
        price_rub: '500.0' 
      },
      { 
        sku: 'JN002-BLU', 
        item_name: 'Slim Jeans', 
        size: '32', 
        price_cny: '120.0',
        price_rub: '1200.0' 
      }
    ]
  }
];
