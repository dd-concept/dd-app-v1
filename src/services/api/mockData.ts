
import { StockItem, Order } from './types';

// Mock data for fallback when API is unavailable
export const MOCK_STOCK: StockItem[] = [
  {
    "sku": "TS001-BLK",
    "item_name": "Basic T-Shirt",
    "color_code": "BLK",
    "brand": "FashionBrand",
    "price_rub": 500.0,
    "sizes": [
      {
        "size": "M",
        "count": 2
      },
      {
        "size": "L",
        "count": 2
      }
    ],
    "photos": [
      {
        "photo_url": "https://example.com/photos/ts001_front.jpg",
        "photo_category": "front"
      },
      {
        "photo_url": "https://example.com/photos/ts001_side.jpg",
        "photo_category": "side"
      }
    ]
  },
  {
    "sku": "JN002-BLU",
    "item_name": "Slim Jeans",
    "color_code": "BLU",
    "brand": "DenimCo",
    "price_rub": 1200.0,
    "sizes": [
      {
        "size": "32",
        "count": 2
      }
    ],
    "photos": [
      {
        "photo_url": "https://example.com/photos/jn002_front.jpg",
        "photo_category": "front"
      }
    ]
  },
  {
    "sku": "SW003-RED",
    "item_name": "Wool Sweater",
    "color_code": "RED",
    "brand": "WinterWear",
    "price_rub": 1500.0,
    "sizes": [
      {
        "size": "S",
        "count": 1
      },
      {
        "size": "M",
        "count": 3
      }
    ],
    "photos": [
      {
        "photo_url": "https://example.com/photos/sw003_front.jpg",
        "photo_category": "front"
      }
    ]
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    order_id: 1,
    order_date: '2023-02-20T00:00:00',
    total_amount: 1500.0,
    status: 'paid',
    items: [
      { sku: 'SW003-RED', item_name: 'Wool Sweater', color_code: 'RED', size: 'M', price_rub: 1500.0 }
    ]
  },
  {
    order_id: 2,
    order_date: '2023-05-15T00:00:00',
    total_amount: 1700.0,
    status: 'pending',
    items: [
      { sku: 'TS001-BLK', item_name: 'Basic T-Shirt', color_code: 'BLK', size: 'L', price_rub: 500.0 },
      { sku: 'JN002-BLU', item_name: 'Slim Jeans', color_code: 'BLU', size: '32', price_rub: 1200.0 }
    ]
  }
];
