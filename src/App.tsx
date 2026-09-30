/* =============================================================================
 * 1. IMPORTS
 * =============================================================================
 */

import '@google/model-viewer'
import { useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import FeedbackPage from './FeedbackPage'

/* =============================================================================
 * 2. TYPES
 * =============================================================================
 */

type ThemeMode = 'dark' | 'light'
type OrderStatus = 'Received' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled'

/* NEW: per-dish customization option */
type CustomizationOption = {
  label: string
  price: number
}

/* NEW: full customization config for a dish */
type DishCustomizations = {
  sizes: CustomizationOption[]          // e.g. Small/Medium/Large with price deltas
  toppings: CustomizationOption[]       // e.g. Extra Cheese +₹30
  spiceLevels: string[]                 // e.g. Mild / Medium / Spicy
}

type Food = {
  id: string
  name: string
  category: string
  price: number
  rating: number
  description: string
  ingredients: string[]
  calories: string
  allergens: string
  spiceLevel: string
  servingSize: string
  image: string
  model?: string
  isVeg: boolean
  bestseller?: boolean
  availability: 'Available' | 'Popular' | 'Out of Stock'
  reviews: number
  customizations: DishCustomizations   // NEW
}

type CartCustomization = { size: string; toppings: string[]; spice: string }

type CartItem = {
  itemKey: string
  foodId: string
  name: string
  price: number
  quantity: number
  customizations: CartCustomization
}

type TableInfo = {
  id: string
  number: number
  status: 'Available' | 'Occupied' | 'Ordering' | 'Waiting for Service' | 'Bill Requested'
}

type OrderItemEntry = {
  foodId: string
  name: string
  quantity: number
  price: number
  customizations: CartCustomization
}

type Order = {
  id: string
  tableNumber: number
  customer: string
  amount: number
  status: OrderStatus
  createdAt: string
  items: OrderItemEntry[]
}

type ServiceRequest = {
  id: string
  tableNumber: number
  type: 'Call Waiter' | 'Request Water' | 'Request Bill' | 'Need Assistance'
  status: 'Pending' | 'Completed'
  createdAt: string
}

type Offer = {
  id: string
  name: string
  discount: string
  startDate: string
  endDate: string
  applicableFood: string
  active: boolean
}

type ReviewItem = {
  id: string
  customer: string
  food: string
  rating: number
  comment: string
  date: string
}

type RestaurantInfo = {
  id: string
  name: string
  tagline: string
  location: string
}

/* =============================================================================
 * 3. STATIC DATA
 * =============================================================================
 */

const restaurant: RestaurantInfo = {
  id: 'restaurant-demo',
  name: 'ARtex Kitchen',
  tagline: 'See it. Explore it. Order it.',
  location: 'Downtown Boulevard',
}

const categories = [
  'All',
  'Pizza',
  'Burgers',
  'Pasta',
  'Indian Food',
  'Snacks',
  'Desserts',
  'Ice Cream',
  'Smoothies',
  'Drinks',
]

/* -----------------------------------------------------------------------------
 * Reusable customization presets — each dish picks what it needs
 * --------------------------------------------------------------------------- */

const PIZZA_SIZES: CustomizationOption[] = [
  { label: 'Small (7")', price: -80 },
  { label: 'Medium (10")', price: 0 },
  { label: 'Large (13")', price: 120 },
]

const PIZZA_TOPPINGS: CustomizationOption[] = [
  { label: 'Extra Cheese', price: 30 },
  { label: 'Mushroom', price: 40 },
  { label: 'Chicken', price: 60 },
  { label: 'Jalapeno', price: 20 },
  { label: 'Olives', price: 25 },
  { label: 'Paneer', price: 50 },
  { label: 'Sweet Corn', price: 20 },
  { label: 'Red Paprika', price: 25 },
]

const BOWL_SIZES: CustomizationOption[] = [
  { label: 'Regular', price: 0 },
  { label: 'Large', price: 80 },
]

const DESSERT_SIZES: CustomizationOption[] = [
  { label: 'Single Scoop', price: 0 },
  { label: 'Double Scoop', price: 60 },
]

const DRINK_SIZES: CustomizationOption[] = [
  { label: 'Small', price: -20 },
  { label: 'Regular', price: 0 },
  { label: 'Large', price: 40 },
]

const SPICE_STANDARD = ['Mild', 'Medium', 'Spicy']
const SPICE_SOFT = ['Mild', 'Medium']

/* -----------------------------------------------------------------------------
 * ALL DISHES — each with its OWN customization set
 * --------------------------------------------------------------------------- */

const initialFoods: Food[] = [
  /* ═══════════ PIZZAS ═══════════ */
  {
    id: 'california-pizza',
    name: 'California Pizza',
    category: 'Pizza',
    price: 379,
    rating: 4.7,
    description: 'Loaded pizza with fresh veggies, herbs and a West-coast style cheese blend.',
    ingredients: ['Pizza base', 'Cheese', 'Tomato', 'Capsicum', 'Onion', 'Herbs'],
    calories: '640 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 pizza',
    image: '/models/California_Pizza.jpg',
    model: '/models/California_Pizza.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 156,
    customizations: {
      sizes: PIZZA_SIZES,
      toppings: PIZZA_TOPPINGS,
      spiceLevels: SPICE_STANDARD,
    },
  },
  {
    id: 'cheese-crust-pizza',
    name: 'Cheese Crust Pizza',
    category: 'Pizza',
    price: 399,
    rating: 4.9,
    description: 'Golden cheese-stuffed crust with creamy mozzarella and tangy tomato sauce.',
    ingredients: ['Pizza base', 'Mozzarella', 'Cheddar', 'Tomato sauce', 'Herbs'],
    calories: '720 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 pizza',
    image: '/models/Cheese_Crust_Pizza.jpg',
    model: '/models/Cheese_Crust_Pizza.glb',
    isVeg: true,
    bestseller: true,
    availability: 'Popular',
    reviews: 289,
    customizations: {
      sizes: PIZZA_SIZES,
      toppings: [
        { label: 'Extra Cheese', price: 40 },
        { label: 'Mushroom', price: 40 },
        { label: 'Jalapeno', price: 20 },
        { label: 'Olives', price: 25 },
        { label: 'Sweet Corn', price: 20 },
      ],
      spiceLevels: SPICE_SOFT,
    },
  },
  {
    id: 'detroit-pizza',
    name: 'Detroit Pizza',
    category: 'Pizza',
    price: 389,
    rating: 4.8,
    description: 'Deep-dish rectangle pizza with crispy cheese edges and rich tomato topping.',
    ingredients: ['Pizza base', 'Cheese', 'Tomato', 'Oregano', 'Olive oil'],
    calories: '740 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Medium',
    servingSize: '1 pizza',
    image: '/models/Detroit_Pizza.jpg',
    model: '/models/Detroit_Pizza.glb',
    isVeg: true,
    availability: 'Popular',
    reviews: 232,
    customizations: {
      sizes: PIZZA_SIZES,
      toppings: PIZZA_TOPPINGS,
      spiceLevels: SPICE_STANDARD,
    },
  },
  {
    id: 'italian-pizza',
    name: 'Italian Pizza',
    category: 'Pizza',
    price: 369,
    rating: 4.8,
    description: 'Classic thin-crust pizza with San Marzano tomato sauce and fresh basil.',
    ingredients: ['Pizza base', 'Tomato sauce', 'Mozzarella', 'Basil', 'Olive oil'],
    calories: '600 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 pizza',
    image: '/models/Italian_Pizza.jpg',
    model: '/models/Italian_Pizza.glb',
    isVeg: true,
    bestseller: true,
    availability: 'Available',
    reviews: 276,
    customizations: {
      sizes: PIZZA_SIZES,
      toppings: [
        { label: 'Extra Cheese', price: 30 },
        { label: 'Mushroom', price: 40 },
        { label: 'Olives', price: 25 },
        { label: 'Basil', price: 15 },
      ],
      spiceLevels: SPICE_SOFT,
    },
  },
  {
    id: 'pan-pizza',
    name: 'Pan Pizza',
    category: 'Pizza',
    price: 339,
    rating: 4.6,
    description: 'Thick, buttery pan-crust pizza loaded with cheese and seasoning.',
    ingredients: ['Pizza base', 'Cheese', 'Butter', 'Tomato sauce', 'Seasoning'],
    calories: '700 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 pizza',
    image: '/models/Pan_Pizza.jpg',
    model: '/models/Pan_Pizza.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 187,
    customizations: {
      sizes: PIZZA_SIZES,
      toppings: PIZZA_TOPPINGS,
      spiceLevels: SPICE_STANDARD,
    },
  },
  {
    id: 'pecorino-cheese-pizza',
    name: 'Pecorino Cheese Pizza',
    category: 'Pizza',
    price: 399,
    rating: 4.9,
    description: 'Sharp Pecorino Romano cheese with a hint of cracked black pepper.',
    ingredients: ['Pizza base', 'Pecorino cheese', 'Mozzarella', 'Pepper', 'Olive oil'],
    calories: '710 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 pizza',
    image: '/models/Pecorino_Cheese_Pizza.jpg',
    model: '/models/Pecorino_Cheese_Pizza.glb',
    isVeg: true,
    bestseller: true,
    availability: 'Popular',
    reviews: 261,
    customizations: {
      sizes: PIZZA_SIZES,
      toppings: [
        { label: 'Extra Cheese', price: 40 },
        { label: 'Mushroom', price: 40 },
        { label: 'Olives', price: 25 },
        { label: 'Pepper', price: 15 },
      ],
      spiceLevels: SPICE_SOFT,
    },
  },
  {
    id: 'peppy-poneer-pizza',
    name: 'Peppy Poneer Pizza',
    category: 'Pizza',
    price: 349,
    rating: 4.7,
    description: 'Paneer, crisp capsicum and red paprika on a cheesy base.',
    ingredients: ['Pizza base', 'Paneer', 'Capsicum', 'Red paprika', 'Cheese'],
    calories: '640 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Medium',
    servingSize: '1 pizza',
    image: '/models/Peppy_Poneer_Pizza.jpg',
    model: '/models/Peppy_Poneer_Pizza.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 209,
    customizations: {
      sizes: PIZZA_SIZES,
      toppings: [
        { label: 'Extra Cheese', price: 30 },
        { label: 'Paneer', price: 50 },
        { label: 'Capsicum', price: 20 },
        { label: 'Red Paprika', price: 25 },
      ],
      spiceLevels: SPICE_STANDARD,
    },
  },
  {
    id: 'sicilian-pizza',
    name: 'Sicilian Pizza',
    category: 'Pizza',
    price: 369,
    rating: 4.8,
    description: 'Thick-crust Sicilian-style pizza with cheese and generous tomato sauce.',
    ingredients: ['Pizza base', 'Cheese', 'Tomato sauce', 'Oregano', 'Olive oil'],
    calories: '680 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 pizza',
    image: '/models/Sicilian_Pizza.jpg',
    model: '/models/Sicilian_Pizza.glb',
    isVeg: true,
    bestseller: true,
    availability: 'Popular',
    reviews: 314,
    customizations: {
      sizes: PIZZA_SIZES,
      toppings: PIZZA_TOPPINGS,
      spiceLevels: SPICE_STANDARD,
    },
  },

  /* ═══════════ PASTA ═══════════ */
  {
    id: 'pasta',
    name: 'Pasta',
    category: 'Pasta',
    price: 259,
    rating: 4.7,
    description: 'Classic pasta with tomato sauce, herbs and a sprinkle of parmesan.',
    ingredients: ['Pasta', 'Tomato sauce', 'Parmesan', 'Basil', 'Olive oil'],
    calories: '520 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 bowl',
    image: '/models/pasta.jpg',
    model: '/models/pasta.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 245,
    customizations: {
      sizes: BOWL_SIZES,
      toppings: [
        { label: 'Extra Cheese', price: 30 },
        { label: 'Mushroom', price: 40 },
        { label: 'Chicken', price: 60 },
        { label: 'Jalapeno', price: 20 },
        { label: 'Olives', price: 25 },
      ],
      spiceLevels: SPICE_STANDARD,
    },
  },

  /* ═══════════ INDIAN FOOD ═══════════ */
  {
    id: 'pav-bhaji',
    name: 'Pav Bhaji',
    category: 'Indian Food',
    price: 199,
    rating: 4.8,
    description: 'Spiced mashed vegetable curry served with buttered pav buns.',
    ingredients: ['Mixed vegetables', 'Tomato', 'Butter', 'Pav buns', 'Masala'],
    calories: '520 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Medium',
    servingSize: '1 plate',
    image: '/models/pav_bhaji.jpg',
    model: '/models/pav_bhaji.glb',
    isVeg: true,
    bestseller: true,
    availability: 'Popular',
    reviews: 245,
    customizations: {
      sizes: [
        { label: 'Half', price: -50 },
        { label: 'Full', price: 0 },
      ],
      toppings: [
        { label: 'Extra Butter', price: 20 },
        { label: 'Extra Pav', price: 30 },
        { label: 'Cheese', price: 40 },
        { label: 'Onion', price: 10 },
      ],
      spiceLevels: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'],
    },
  },

  /* ═══════════ DESSERTS ═══════════ */
  {
    id: 'coconut-crush',
    name: 'Coconut Crush',
    category: 'Desserts',
    price: 179,
    rating: 4.6,
    description: 'Chilled coconut milk dessert with tender coconut chunks and jaggery.',
    ingredients: ['Coconut milk', 'Tender coconut', 'Jaggery', 'Cardamom'],
    calories: '280 kcal',
    allergens: 'None',
    spiceLevel: 'Mild',
    servingSize: '1 cup',
    image: '/models/Coconut_Crush.jpg',
    model: '/models/Coconut_Crush.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 134,
    customizations: {
      sizes: DESSERT_SIZES,
      toppings: [
        { label: 'Extra Jaggery', price: 20 },
        { label: 'Tender Coconut', price: 30 },
        { label: 'Cardamom', price: 10 },
      ],
      spiceLevels: ['Mild'],
    },
  },
  {
    id: 'cookie-dough',
    name: 'Cookie Dough',
    category: 'Desserts',
    price: 189,
    rating: 4.8,
    description: 'Edible cookie dough with chocolate chips — safe to eat raw.',
    ingredients: ['Flour', 'Butter', 'Sugar', 'Chocolate chips', 'Vanilla'],
    calories: '410 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 cup',
    image: '/models/Cookie_Dough.jpg',
    model: '/models/Cookie_Dough.glb',
    isVeg: true,
    availability: 'Popular',
    reviews: 198,
    customizations: {
      sizes: DESSERT_SIZES,
      toppings: [
        { label: 'Extra Chocolate Chips', price: 25 },
        { label: 'Sprinkles', price: 15 },
        { label: 'Caramel Drizzle', price: 30 },
      ],
      spiceLevels: ['Mild'],
    },
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    category: 'Desserts',
    price: 129,
    rating: 4.5,
    description: 'Fluffy spun sugar candy in a rainbow of pastel colours.',
    ingredients: ['Sugar', 'Food colouring', 'Flavouring'],
    calories: '180 kcal',
    allergens: 'None',
    spiceLevel: 'Mild',
    servingSize: '1 stick',
    image: '/models/Cotton_Candy.jpg',
    model: '/models/Cotton_Candy.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 112,
    customizations: {
      sizes: [
        { label: 'Small', price: 0 },
        { label: 'Jumbo', price: 50 },
      ],
      toppings: [
        { label: 'Rainbow Sprinkles', price: 15 },
        { label: 'Glitter Dust', price: 20 },
      ],
      spiceLevels: ['Mild'],
    },
  },
  {
    id: 'salted-caramel',
    name: 'Salted Caramel',
    category: 'Desserts',
    price: 169,
    rating: 4.9,
    description: 'Rich, buttery caramel with a hint of sea salt — served warm.',
    ingredients: ['Sugar', 'Butter', 'Cream', 'Sea salt', 'Vanilla'],
    calories: '420 kcal',
    allergens: 'Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 serving',
    image: '/models/Salted_Caramel.jpg',
    model: '/models/Salted_Caramel.glb',
    isVeg: true,
    bestseller: true,
    availability: 'Popular',
    reviews: 284,
    customizations: {
      sizes: DESSERT_SIZES,
      toppings: [
        { label: 'Extra Sea Salt', price: 10 },
        { label: 'Crushed Nuts', price: 35 },
        { label: 'Chocolate Drizzle', price: 30 },
      ],
      spiceLevels: ['Mild'],
    },
  },

  /* ═══════════ ICE CREAM ═══════════ */
  {
    id: 'vanilla-bean',
    name: 'Vanilla Bean',
    category: 'Ice Cream',
    price: 159,
    rating: 4.8,
    description: 'Classic vanilla bean ice cream with real Madagascar vanilla.',
    ingredients: ['Milk', 'Cream', 'Sugar', 'Vanilla bean'],
    calories: '290 kcal',
    allergens: 'Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 scoop',
    image: '/models/Vanilla_Bean.jpg',
    model: '/models/Vanilla_Bean.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 221,
    customizations: {
      sizes: DESSERT_SIZES,
      toppings: [
        { label: 'Hot Chocolate Sauce', price: 30 },
        { label: 'Crushed Nuts', price: 35 },
        { label: 'Rainbow Sprinkles', price: 15 },
        { label: 'Waffle Cone', price: 25 },
      ],
      spiceLevels: ['Mild'],
    },
  },

  /* ═══════════ SMOOTHIES ═══════════ */
  {
    id: 'pineapple-smoothie',
    name: 'Pineapple Smoothie',
    category: 'Smoothies',
    price: 139,
    rating: 4.5,
    description: 'Tangy pineapple blended with coconut milk and a hint of ginger.',
    ingredients: ['Pineapple', 'Coconut milk', 'Ginger', 'Honey'],
    calories: '220 kcal',
    allergens: 'None',
    spiceLevel: 'Mild',
    servingSize: '300 ml',
    image: '/models/Pineapple_Smoothie.jpg',
    model: '/models/Pineapple_Smoothie.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 118,
    customizations: {
      sizes: DRINK_SIZES,
      toppings: [
        { label: 'Chia Seeds', price: 20 },
        { label: 'Extra Honey', price: 15 },
        { label: 'Mint Leaves', price: 10 },
      ],
      spiceLevels: ['Mild'],
    },
  },
]

const initialTables: TableInfo[] = Array.from({ length: 12 }, (_, index) => ({
  id: `table-${index + 1}`,
  number: index + 1,
  status: index % 3 === 0 ? 'Occupied' : 'Available',
}))

const initialOrders: Order[] = [
  {
    id: 'AR1024',
    tableNumber: 12,
    customer: 'Aarav',
    amount: 524,
    status: 'Preparing',
    createdAt: 'Today, 7:45 PM',
    items: [
      { foodId: 'chicken-tikka-pizza', name: 'Chicken Tikka Pizza', quantity: 1, price: 349, customizations: { size: 'Medium', toppings: ['Extra Cheese'], spice: 'Medium' } },
      { foodId: 'cold-coffee', name: 'Cold Coffee', quantity: 1, price: 120, customizations: { size: 'Medium', toppings: [], spice: 'Mild' } },
    ],
  },
  {
    id: 'AR1023',
    tableNumber: 5,
    customer: 'Meera',
    amount: 298,
    status: 'Ready',
    createdAt: 'Today, 7:20 PM',
    items: [{ foodId: 'cheese-pasta', name: 'Cheese Pasta', quantity: 1, price: 289, customizations: { size: 'Medium', toppings: ['Mushroom'], spice: 'Mild' } }],
  },
]

const initialServiceRequests: ServiceRequest[] = [
  { id: 'sr-102', tableNumber: 12, type: 'Request Water', status: 'Pending', createdAt: 'Today, 7:40 PM' },
  { id: 'sr-109', tableNumber: 7, type: 'Need Assistance', status: 'Completed', createdAt: 'Today, 7:05 PM' },
]

const initialOffers: Offer[] = [
  { id: 'offer-1', name: '20% OFF', discount: '20%', startDate: '2026-09-20', endDate: '2026-09-30', applicableFood: 'Pizza', active: true },
  { id: 'offer-2', name: 'Buy 1 Get 1', discount: '50%', startDate: '2026-09-10', endDate: '2026-09-26', applicableFood: 'Smoothies', active: true },
  { id: 'offer-3', name: 'Weekend Special', discount: '₹100 OFF', startDate: '2026-09-23', endDate: '2026-09-27', applicableFood: 'Pasta', active: false },
]

const initialReviews: ReviewItem[] = [
  { id: 'rv-1', customer: 'Aanya', food: 'Cheese Crust Pizza', rating: 5, comment: 'The flavors were incredible and the 3D preview made it easy to pick.', date: 'Today' },
  { id: 'rv-2', customer: 'Rohan', food: 'Pasta', rating: 5, comment: 'Creamy and comforting, definitely order again.', date: 'Yesterday' },
  { id: 'rv-3', customer: 'Neha', food: 'Pineapple Smoothie', rating: 4, comment: 'Tasted good and the order arrived quick.', date: 'Recently' },
]

/* =============================================================================
 * 4. CUSTOM HOOK — useLocalStorage
 * =============================================================================
 */
function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const value = window.localStorage.getItem(key)
      return value ? (JSON.parse(value) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState] as const
}

/* =============================================================================
 * 4b. SCROLL TO TOP
 * =============================================================================
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

/* =============================================================================
 * 5. APP
 * =============================================================================
 */
function App() {
  const [theme, setTheme] = useLocalStorage<ThemeMode>('artex-theme', 'dark')
  const [foods, setFoods] = useLocalStorage<Food[]>('artex-foods', initialFoods)
  const [cart, setCart] = useLocalStorage<CartItem[]>('artex-cart', [])
  const [orders, setOrders] = useLocalStorage<Order[]>('artex-orders', initialOrders)
  const [tables, setTables] = useLocalStorage<TableInfo[]>('artex-tables', initialTables)
  const [serviceRequests, setServiceRequests] = useLocalStorage<ServiceRequest[]>('artex-service-requests', initialServiceRequests)
  const [offers, setOffers] = useLocalStorage<Offer[]>('artex-offers', initialOffers)
  const [reviews] = useLocalStorage<ReviewItem[]>('artex-reviews', initialReviews)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (food: Food, customizations: CartCustomization = { size: 'Medium', toppings: [], spice: 'Mild' }) => {
    const itemKey = `${food.id}-${customizations.size}-${customizations.spice}-${customizations.toppings.join('|')}`

    /* NEW: compute price from this dish's own customization prices */
    const sizeOption = food.customizations.sizes.find((s) => s.label === customizations.size)
    const sizeDelta = sizeOption?.price ?? 0
    const toppingFee = customizations.toppings.reduce((sum, label) => {
      const option = food.customizations.toppings.find((t) => t.label === label)
      return sum + (option?.price ?? 0)
    }, 0)
    const itemPrice = food.price + sizeDelta + toppingFee

    setCart((current) => {
      const existing = current.find((entry) => entry.itemKey === itemKey)
      if (existing) {
        return current.map((entry) =>
          entry.itemKey === itemKey
            ? { ...entry, quantity: entry.quantity + 1, price: itemPrice }
            : entry,
        )
      }

      return [
        ...current,
        {
          itemKey,
          foodId: food.id,
          name: food.name,
          price: itemPrice,
          quantity: 1,
          customizations,
        },
      ]
    })
  }

  const requestService = (type: ServiceRequest['type'], tableNumber: number) => {
    const entry: ServiceRequest = {
      id: `sr-${Date.now()}`,
      tableNumber,
      type,
      status: 'Pending',
      createdAt: 'Just now',
    }
    setServiceRequests((current) => [entry, ...current])
  }

  const createOrder = (tableNumber: number, customer: string, items: CartItem[]) => {
    const orderId = `AR${Math.floor(1000 + Math.random() * 9000)}`
    const orderAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + 25
    const newOrder: Order = {
      id: orderId,
      tableNumber,
      customer,
      amount: orderAmount,
      status: 'Received',
      createdAt: 'Just now',
      items: items.map((entry) => ({
        foodId: entry.foodId,
        name: entry.name,
        quantity: entry.quantity,
        price: entry.price,
        customizations: entry.customizations,
      })),
    }

    setOrders((current) => [newOrder, ...current])
    setCart([])
    return newOrder
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/menu/restaurant-demo" replace />} />

          <Route
            path="/menu/:restaurantId"
            element={
              <CustomerExperience
                restaurant={restaurant}
                foods={foods}
                cartCount={cartCount}
                theme={theme}
                setTheme={setTheme}
                addToCart={addToCart}
                requestService={requestService}
              />
            }
          />

          <Route
            path="/menu/:restaurantId/table/:tableId"
            element={
              <CustomerExperience
                restaurant={restaurant}
                foods={foods}
                cartCount={cartCount}
                theme={theme}
                setTheme={setTheme}
                addToCart={addToCart}
                requestService={requestService}
              />
            }
          />

          <Route
            path="/food/:foodId"
            element={
              <FoodDetailPage
                foods={foods}
                cartCount={cartCount}
                addToCart={addToCart}
                requestService={requestService}
                tables={tables}
                theme={theme}
                setTheme={setTheme}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                foods={foods}
                setCart={setCart}
                createOrder={createOrder}
                tables={tables}
                theme={theme}
                setTheme={setTheme}
              />
            }
          />

          <Route
            path="/order/:orderId"
            element={
              <OrderStatusPage
                orders={orders}
                theme={theme}
                setTheme={setTheme}
                requestService={requestService}
              />
            }
          />

          <Route
            path="/bill/:orderId"
            element={<BillPage orders={orders} theme={theme} setTheme={setTheme} />}
          />

          <Route path="/feedback" element={<FeedbackPage />} />

          <Route path="/admin/*" element={<AdminRouter theme={theme} setTheme={setTheme} foods={foods} setFoods={setFoods} orders={orders} setOrders={setOrders} tables={tables} setTables={setTables} serviceRequests={serviceRequests} offers={offers} setOffers={setOffers} reviews={reviews} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

/* =============================================================================
 * 6. CUSTOMER EXPERIENCE
 * =============================================================================
 */
function CustomerExperience({
  restaurant,
  foods,
  cartCount,
  theme,
  setTheme,
  addToCart,
  requestService,
}: {
  restaurant: RestaurantInfo
  foods: Food[]
  cartCount: number
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
  addToCart: (food: Food, customizations?: CartCustomization) => void
  requestService: (type: ServiceRequest['type'], tableNumber: number) => void
}) {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const currentTableNumber = Number(tableId ?? 12)

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = activeCategory === 'All' || food.category === activeCategory
    const matchesSearch =
      searchTerm.trim().length === 0 ||
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  return (
    <div className="page-shell customer-page">
      <header className="topbar glass-card">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">ARtex 3D Menu</div>
            <div className="brand-subtitle">{restaurant.name}</div>
          </div>
        </div>

        <div className="table-pill">Table {currentTableNumber}</div>

        <div className="header-actions">
          <div className="searchbox">
            <span>⌕</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search dishes, ingredients..."
            />
            <button
              type="button"
              className="text-button"
              title="Search by keyword"
              onClick={() => {
                const keyword = prompt('Enter a dish name or category:', searchTerm)
                if (keyword !== null) {
                  setSearchTerm(keyword.trim())
                }
              }}
            >
              🔍
            </button>
          </div>

          <button type="button" className="ghost-button" onClick={() => navigate('/feedback')}>
            💬 Feedback
          </button>

          <button type="button" className="ghost-button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button type="button" className="cart-button" onClick={() => navigate('/cart')}>
            🛒 <span>{cartCount}</span>
          </button>
        </div>
      </header>

      <main className="content-shell">
        <section className="hero-banner glass-card">
          <div className="hero-copy">
            <span className="eyebrow">Premium digital dining</span>
            <h1>Explore Your Food Before You Order</h1>
            <p>Discover dishes through interactive 3D experiences, rich detail, and chef-approved recommendations.</p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => navigate(`/food/${foods[0].id}`)}>
                Explore Menu
              </button>
              <button type="button" className="secondary-button" onClick={() => requestService('Call Waiter', currentTableNumber)}>
                Call Waiter
              </button>
            </div>
          </div>

          <div className="featured-dish">
            <div className="featured-badge">Chef’s Pick</div>
            <img src={foods[0].image} alt={foods[0].name} />
            <div className="featured-meta">
              <div>
                <strong>{foods[0].name}</strong>
                <small>⭐⭐⭐⭐⭐ 4.8</small>
              </div>
              <span>₹{foods[0].price}</span>
            </div>
          </div>
        </section>

        <section className="category-bar glass-card">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'pill active' : 'pill'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </section>

        <section className="food-grid-section">
          <div className="section-header">
            <h2>Featured items</h2>
            <button type="button" className="text-button" onClick={() => navigate('/cart')}>
              View cart
            </button>
          </div>

          <div className="food-grid">
            {filteredFoods.map((food) => (
              <article
                key={food.id}
                className="food-card glass-card"
                style={{ cursor: 'pointer', width: '100%', minWidth: 0 }}
                onClick={() => navigate(`/food/${food.id}`)}
              >
                <div className="card-image-wrap">
                  <img src={food.image} alt={food.name} />
                  {food.bestseller ? <span className="tag bestseller">Bestseller</span> : null}
                  <span className="tag availability">{food.model ? '3D Ready' : '2D'}</span>
                </div>

                <div className="card-body">
                  <div className="card-topline">
                    <span className={`food-type ${food.isVeg ? 'veg' : 'non-veg'}`}>{food.isVeg ? 'Veg' : 'Non-Veg'}</span>
                    <span className="rating">⭐ {food.rating}</span>
                  </div>

                  <h3>{food.name}</h3>
                  <p>{food.description}</p>

                  <div className="price-row">
                    <strong>₹{food.price}</strong>
                    <span>{food.category}</span>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="secondary-button small-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/food/${food.id}`)
                      }}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="primary-button small-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(food)
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="service-bar glass-card">
          <button type="button" onClick={() => requestService('Call Waiter', currentTableNumber)}>Call Waiter</button>
          <button type="button" onClick={() => requestService('Request Water', currentTableNumber)}>Request Water</button>
          <button type="button" onClick={() => requestService('Request Bill', currentTableNumber)}>Request Bill</button>
          <button type="button" onClick={() => requestService('Need Assistance', currentTableNumber)}>Need Assistance</button>
        </section>
      </main>
    </div>
  )
}

/* =============================================================================
 * 7. FOOD DETAIL PAGE — now reads customizations from the food itself
 * =============================================================================
 */
function FoodDetailPage({
  foods,
  cartCount,
  addToCart,
  requestService,
  tables,
  theme,
  setTheme,
}: {
  foods: Food[]
  cartCount: number
  addToCart: (food: Food, customizations?: CartCustomization) => void
  requestService: (type: ServiceRequest['type'], tableNumber: number) => void
  tables: TableInfo[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  const navigate = useNavigate()
  const { foodId } = useParams()
  const food = foods.find((item) => item.id === foodId) ?? foods[0]
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')

  /* NEW: initialize state from this dish's own customizations */
  const defaultSize = food.customizations.sizes[1]?.label ?? food.customizations.sizes[0]?.label ?? 'Regular'
  const defaultSpice = food.customizations.spiceLevels.includes('Medium')
    ? 'Medium'
    : food.customizations.spiceLevels[0] ?? 'Mild'

  const [size, setSize] = useState(defaultSize)
  const [toppings, setToppings] = useState<string[]>([])
  const [spice, setSpice] = useState(defaultSpice)
  const [quantity, setQuantity] = useState(1)

  /* NEW: reset selection when the food changes */
  useEffect(() => {
    setSize(food.customizations.sizes[1]?.label ?? food.customizations.sizes[0]?.label ?? 'Regular')
    setToppings([])
    setSpice(
      food.customizations.spiceLevels.includes('Medium')
        ? 'Medium'
        : food.customizations.spiceLevels[0] ?? 'Mild'
    )
    setQuantity(1)
  }, [food.id])

  /* NEW: price computation from this dish's own options */
  const sizeOption = food.customizations.sizes.find((s) => s.label === size)
  const sizeDelta = sizeOption?.price ?? 0
  const extraCharge = toppings.reduce((sum, label) => {
    const option = food.customizations.toppings.find((t) => t.label === label)
    return sum + (option?.price ?? 0)
  }, 0)
  const basePrice = food.price + sizeDelta
  const total = (basePrice + extraCharge) * quantity
  const tableNumber = tables[0]?.number ?? 12

  const toggleTopping = (topping: string) => {
    setToppings((current) =>
      current.includes(topping)
        ? current.filter((value) => value !== topping)
        : [...current, topping],
    )
  }

  return (
    <div className="page-shell customer-page detail-page">
      <header className="topbar glass-card">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">ARtex 3D Menu</div>
            <div className="brand-subtitle">{restaurant.name}</div>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="ghost-button" onClick={() => navigate('/feedback')}>
            💬 Feedback
          </button>
          <button type="button" className="ghost-button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button type="button" className="cart-button" onClick={() => navigate('/cart')}>
            🛒 <span>{cartCount}</span>
          </button>
        </div>
      </header>

      <main className="content-shell detail-main">
        <div className="viewer-panel glass-card">
          <div className="viewer-topbar">
            <div className="mode-toggle">
              <button type="button" className={viewMode === '2d' ? 'active' : ''} onClick={() => setViewMode('2d')}>2D View</button>
              <button type="button" className={viewMode === '3d' ? 'active' : ''} onClick={() => setViewMode('3d')}>3D View</button>
            </div>
            <button type="button" className="ghost-button" onClick={() => navigate('/menu/restaurant-demo')}>← Menu</button>
          </div>

          {viewMode === '3d' ? (
            <Food3DViewer food={food} />
          ) : (
            <img
              src={food.image}
              alt={food.name}
              className="detail-image"
            />
          )}
        </div>

        <div className="detail-copy">
          <div className="detail-header-row">
            <div>
              <span className="eyebrow">{food.category}</span>
              <h1>{food.name}</h1>
            </div>
            <div className="price-tag">₹{food.price}</div>
          </div>

          <div className="rating-line">⭐⭐⭐⭐⭐ 4.8</div>
          <p className="description">{food.description}</p>

          <div className="info-grid">
            <div><span>Ingredients</span><p>{food.ingredients.join(', ')}</p></div>
            <div><span>Calories</span><p>{food.calories}</p></div>
            <div><span>Allergens</span><p>{food.allergens}</p></div>
            <div><span>Spice Level</span><p>{food.spiceLevel}</p></div>
            <div><span>Serving Size</span><p>{food.servingSize}</p></div>
          </div>

          <div className="customizer glass-card">
            <h3>Customize your order</h3>

            {/* SIZE — from this dish only */}
            <div className="customizer-group">
              <label>Size</label>
              <div className="radio-list">
                {food.customizations.sizes.map((option) => (
                  <label key={option.label} className={size === option.label ? 'choice selected' : 'choice'}>
                    <input
                      type="radio"
                      name="size"
                      checked={size === option.label}
                      onChange={() => setSize(option.label)}
                    />
                    {option.label}
                    {option.price !== 0 ? (
                      <span style={{ marginLeft: 6, opacity: 0.75 }}>
                        {option.price > 0 ? `+₹${option.price}` : `−₹${Math.abs(option.price)}`}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            </div>

            {/* TOPPINGS — from this dish only */}
            {food.customizations.toppings.length > 0 ? (
              <div className="customizer-group">
                <label>Toppings</label>
                <div className="check-list">
                  {food.customizations.toppings.map((option) => (
                    <label key={option.label} className={toppings.includes(option.label) ? 'choice selected' : 'choice'}>
                      <input
                        type="checkbox"
                        checked={toppings.includes(option.label)}
                        onChange={() => toggleTopping(option.label)}
                      />
                      {option.label} +₹{option.price}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {/* SPICE — from this dish only */}
            {food.customizations.spiceLevels.length > 0 ? (
              <div className="customizer-group">
                <label>Spice</label>
                <div className="radio-list">
                  {food.customizations.spiceLevels.map((option) => (
                    <label key={option} className={spice === option ? 'choice selected' : 'choice'}>
                      <input
                        type="radio"
                        name="spice"
                        checked={spice === option}
                        onChange={() => setSpice(option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="quantity-row">
              <label>Quantity</label>
              <div className="quantity-box">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => value + 1)}>＋</button>
              </div>
            </div>
          </div>

          <div className="totals-box glass-card">
            <div className="summary-line"><span>Base Price</span><strong>₹{basePrice}</strong></div>
            <div className="summary-line"><span>Customization</span><strong>₹{extraCharge}</strong></div>
            <div className="summary-line"><span>Quantity</span><strong>{quantity}</strong></div>
            <div className="summary-line total"><span>Total</span><strong>₹{total}</strong></div>
            <div className="action-stack">
              <button type="button" className="primary-button full-width" onClick={() => {
                addToCart(food, { size, toppings, spice })
                navigate('/cart')
              }}>
                Add to Cart
              </button>
              <button type="button" className="secondary-button full-width" onClick={() => requestService('Call Waiter', tableNumber)}>
                Call Waiter
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* =============================================================================
 * 8. CART PAGE
 * =============================================================================
 */
function CartPage({
  cart,
  foods,
  setCart,
  createOrder,
  tables,
  theme,
  setTheme,
}: {
  cart: CartItem[]
  foods: Food[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  createOrder: (tableNumber: number, customer: string, items: CartItem[]) => Order
  tables: TableInfo[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  const navigate = useNavigate()
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const discount = subtotal > 500 ? 50 : 0
  const total = subtotal + tax - discount

  const handlePlaceOrder = () => {
    if (cart.length === 0) return
    const order = createOrder(tables[0]?.number ?? 12, 'Customer', cart)
    navigate(`/order/${order.id}`)
  }

  return (
    <div className="page-shell customer-page">
      <header className="topbar glass-card">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">Your Cart</div>
            <div className="brand-subtitle">{restaurant.name}</div>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="ghost-button" onClick={() => navigate('/feedback')}>
            💬 Feedback
          </button>
          <button type="button" className="ghost-button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate('/menu/restaurant-demo')}>
            Continue Shopping
          </button>
        </div>
      </header>

      <main className="content-shell cart-layout">
        <section className="cart-items-panel glass-card">
          <h2>Items in cart</h2>

          {cart.length === 0 ? (
            <div className="empty-state">
              <p>Your cart is empty. Add a delicious dish to begin.</p>
              <button type="button" className="primary-button" onClick={() => navigate('/menu/restaurant-demo')}>
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const food = foods.find((entry) => entry.id === item.foodId)
              return (
                <div key={item.itemKey} className="cart-item">
                  <img src={food?.image ?? ''} alt={item.name} />
                  <div className="cart-item-content">
                    <div className="cart-headline">
                      <strong>{item.name}</strong>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          const ok = confirm(`Remove "${item.name}" from your cart?`)
                          if (ok) {
                            setCart((current) => current.filter((entry) => entry.itemKey !== item.itemKey))
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <p>{item.customizations.size} • {item.customizations.spice} • {item.customizations.toppings.join(', ') || 'No extra toppings'}</p>
                    <div className="cart-footer">
                      <span>Qty: {item.quantity}</span>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </section>

        <aside className="cart-summary glass-card">
          <h3>Order Summary</h3>
          <div className="summary-line"><span>Subtotal</span><strong>₹{subtotal}</strong></div>
          <div className="summary-line"><span>Taxes</span><strong>₹{tax.toFixed(0)}</strong></div>
          <div className="summary-line"><span>Discount</span><strong>₹{discount}</strong></div>
          <div className="summary-line total"><span>Total</span><strong>₹{total.toFixed(0)}</strong></div>

          <button type="button" className="primary-button full-width" onClick={handlePlaceOrder} disabled={cart.length === 0}>
            Place Order
          </button>
        </aside>
      </main>
    </div>
  )
}

/* =============================================================================
 * 9. ORDER STATUS PAGE
 * =============================================================================
 */
function OrderStatusPage({
  orders,
  theme,
  setTheme,
  requestService,
}: {
  orders: Order[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
  requestService: (type: ServiceRequest['type'], tableNumber: number) => void
}) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const order = orders.find((entry) => entry.id === orderId) ?? orders[0]
  const timeline = ['Received', 'Preparing', 'Ready', 'Served']
  const currentStageIndex = Math.max(0, timeline.indexOf(order?.status ?? 'Received'))

  return (
    <div className="page-shell customer-page">
      <header className="topbar glass-card">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">Order Status</div>
            <div className="brand-subtitle">Table {order?.tableNumber ?? 12}</div>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="ghost-button" onClick={() => navigate('/feedback')}>
            💬 Feedback
          </button>
          <button type="button" className="ghost-button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button type="button" className="secondary-button" onClick={() => requestService('Request Bill', order?.tableNumber ?? 12)}>
            Request Bill
          </button>
        </div>
      </header>

      <main className="content-shell order-layout">
        <section className="glass-card order-confirmation">
          <div className="success-badge">Order Confirmed 🎉</div>
          <h1>Order #{order?.id ?? 'AR1024'}</h1>
          <p>Table {order?.tableNumber ?? 12}</p>
          <div className="timeline-block">
            {timeline.map((step, index) => {
              const active = index <= currentStageIndex
              const done = index < currentStageIndex
              return (
                <div key={step} className="timeline-step">
                  <span className={active ? 'dot active' : 'dot'}>{done ? '✓' : index === currentStageIndex ? '●' : '○'}</span>
                  <div className="step-label">{step}</div>
                  {index < timeline.length - 1 ? <div className="step-connector" /> : null}
                </div>
              )
            })}
          </div>
        </section>

        <section className="glass-card order-summary-panel">
          <h3>Items</h3>
          <ul className="order-items-list">
            {order?.items.map((item) => (
              <li key={`${order.id}-${item.name}`}>
                <span>{item.quantity} × {item.name}</span>
                <strong>₹{item.price * item.quantity}</strong>
              </li>
            ))}
          </ul>
          <div className="summary-line total"><span>Estimated prep time</span><strong>18 mins</strong></div>
          <button type="button" className="primary-button full-width" onClick={() => navigate(`/bill/${order.id}`)}>
            View Bill
          </button>
        </section>
      </main>
    </div>
  )
}

/* =============================================================================
 * 10. BILL PAGE
 * =============================================================================
 */
function BillPage({
  orders,
  theme,
  setTheme,
}: {
  orders: Order[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const order = orders.find((entry) => entry.id === orderId) ?? orders[0]
  const subtotal = order?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0
  const tax = subtotal * 0.05
  const total = subtotal + tax

  return (
    <div className="page-shell customer-page">
      <header className="topbar glass-card">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">Digital Bill</div>
            <div className="brand-subtitle">Table {order?.tableNumber ?? 12}</div>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="ghost-button" onClick={() => navigate('/feedback')}>
            💬 Feedback
          </button>
          <button type="button" className="ghost-button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="content-shell bill-layout">
        <section className="glass-card bill-card">
          <h2>ARtex Kitchen</h2>
          {order?.items.map((item) => (
            <div key={`${order.id}-${item.name}`} className="bill-row">
              <span>{item.name} × {item.quantity}</span>
              <strong>₹{item.price * item.quantity}</strong>
            </div>
          ))}

          <div className="bill-divider" />
          <div className="summary-line"><span>Subtotal</span><strong>₹{subtotal}</strong></div>
          <div className="summary-line"><span>Tax</span><strong>₹{tax.toFixed(0)}</strong></div>
          <div className="summary-line total"><span>Total</span><strong>₹{total.toFixed(0)}</strong></div>

          <div className="action-stack bill-actions">
            <button type="button" className="secondary-button full-width" onClick={() => navigate('/menu/restaurant-demo')}>View Bill</button>
            <button type="button" className="secondary-button full-width" onClick={() => navigate('/menu/restaurant-demo')}>Request Bill</button>
            <button type="button" className="primary-button full-width" onClick={() => navigate('/menu/restaurant-demo')}>Pay Now</button>
          </div>
        </section>
      </main>
    </div>
  )
}

/* =============================================================================
 * 11. 3D VIEWER
 * =============================================================================
 */
function Food3DViewer({ food }: { food: Food }) {
  const [loaded, setLoaded] = useState(false)
  const viewerRef = useRef<any>(null)

  useEffect(() => {
    setLoaded(false)
  }, [food.id])

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return

    const handleLoad = () => setLoaded(true)
    const handleError = () => {
      console.error('3D model failed to load:', food.model)
      setLoaded(true)
    }

    el.addEventListener('load', handleLoad)
    el.addEventListener('error', handleError)
    return () => {
      el.removeEventListener('load', handleLoad)
      el.removeEventListener('error', handleError)
    }
  }, [food.id, food.model])

  if (!food.model || !food.model.trim()) {
    return (
      <div className="fallback-viewer">
        <img src={food.image} alt={food.name} />
        <span>3D model unavailable, showing image preview.</span>
      </div>
    )
  }

  const ModelViewer = 'model-viewer' as any

  return (
    <div
      className="model-viewer-wrap"
      style={{ minHeight: 280 }}
    >
      {!loaded ? <div className="loading-overlay">Loading 3D model...</div> : null}
      <ModelViewer
        ref={viewerRef}
        className="food-model-viewer"
        src={food.model}
        alt={food.name}
        style={{ width: '100%', height: '100%', display: 'block' }}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        exposure="1.2"
        camera-orbit="30deg 80deg 2.5m"
      />
    </div>
  )
}

/* =============================================================================
 * 12. ADMIN ROUTER
 * =============================================================================
 */
function AdminRouter({
  theme,
  setTheme,
  foods,
  setFoods,
  orders,
  setOrders,
  tables,
  setTables,
  serviceRequests,
  offers,
  setOffers,
  reviews,
}: {
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
  foods: Food[]
  setFoods: React.Dispatch<React.SetStateAction<Food[]>>
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  tables: TableInfo[]
  setTables: React.Dispatch<React.SetStateAction<TableInfo[]>>
  serviceRequests: ServiceRequest[]
  offers: Offer[]
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>
  reviews: ReviewItem[]
}) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/login" element={<AdminLoginPage />} />
      <Route
        path="/dashboard"
        element={<AdminDashboardPage theme={theme} setTheme={setTheme} foods={foods} orders={orders} serviceRequests={serviceRequests} tables={tables} reviews={reviews} />}
      />
      <Route
        path="/orders"
        element={<AdminOrdersPage orders={orders} setOrders={setOrders} theme={theme} setTheme={setTheme} />}
      />
      <Route path="/kitchen" element={<AdminKitchenPage orders={orders} setOrders={setOrders} theme={theme} setTheme={setTheme} />} />
      <Route path="/menu" element={<AdminMenuPage foods={foods} setFoods={setFoods} theme={theme} setTheme={setTheme} />} />
      <Route path="/models" element={<AdminModelsPage foods={foods} theme={theme} setTheme={setTheme} />} />
      <Route path="/tables" element={<AdminTablesPage tables={tables} setTables={setTables} serviceRequests={serviceRequests} theme={theme} setTheme={setTheme} />} />
      <Route path="/qr" element={<AdminQRPage tables={tables} theme={theme} setTheme={setTheme} />} />
      <Route path="/offers" element={<AdminOffersPage offers={offers} setOffers={setOffers} theme={theme} setTheme={setTheme} />} />
      <Route path="/reviews" element={<AdminReviewsPage reviews={reviews} theme={theme} setTheme={setTheme} />} />
      <Route path="/analytics" element={<AdminAnalyticsPage foods={foods} orders={orders} theme={theme} setTheme={setTheme} />} />
      <Route path="/settings" element={<AdminSettingsPage theme={theme} setTheme={setTheme} />} />
      <Route path="/feedback" element={<FeedbackPage />} />
    </Routes>
  )
}

/* =============================================================================
 * 13. ADMIN LOGIN
 * =============================================================================
 */
function AdminLoginPage() {
  return (
    <div className="admin-login-screen">
      <div className="glass-card auth-card">
        <span className="eyebrow">Restaurant admin</span>
        <h1>Welcome back</h1>
        <p>Sign in to manage orders, menu, tables and 3D experiences.</p>
        <div className="auth-form">
          <input type="email" value="manager@artexkitchen.com" readOnly />
          <input type="password" value="••••••••" readOnly />
          <Link to="/admin/dashboard" className="primary-button full-width center-link">Login to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}

/* =============================================================================
 * 14. ADMIN LAYOUT
 * =============================================================================
 */
function AdminLayout({
  title,
  children,
  theme,
  setTheme,
}: {
  title: string
  children: React.ReactNode
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Kitchen', path: '/admin/kitchen' },
    { label: 'Menu', path: '/admin/menu' },
    { label: 'Categories', path: '/admin/menu' },
    { label: '3D Food Models', path: '/admin/models' },
    { label: 'Tables', path: '/admin/tables' },
    { label: 'QR Codes', path: '/admin/qr' },
    { label: 'Offers', path: '/admin/offers' },
    { label: 'Reviews', path: '/admin/reviews' },
    { label: 'Analytics', path: '/admin/analytics' },
    { label: 'Settings', path: '/admin/settings' },
    { label: '💬 Feedback', path: '/feedback' },
  ]

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar glass-card">
        <div className="brand-wrap sidebar-brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">ARtex</div>
            <div className="brand-subtitle">Admin</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.path} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header glass-card">
          <div>
            <span className="eyebrow">Restaurant dashboard</span>
            <h2>{title}</h2>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost-button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link to="/menu/restaurant-demo" className="secondary-button">View menu</Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}

/* =============================================================================
 * 15. ADMIN DASHBOARD
 * =============================================================================
 */
function AdminDashboardPage({
  theme,
  setTheme,
  foods,
  orders,
  serviceRequests,
  tables,
  reviews,
}: {
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
  foods: Food[]
  orders: Order[]
  serviceRequests: ServiceRequest[]
  tables: TableInfo[]
  reviews: ReviewItem[]
}) {
  const avgRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)

  return (
    <AdminLayout title="Dashboard" theme={theme} setTheme={setTheme}>
      <div className="stats-grid">
        <StatCard label="Today's Orders" value="127" trend="+12%" accent="gold" />
        <StatCard label="Today's Revenue" value="₹38,450" trend="+18%" accent="rose" />
        <StatCard label="Active Tables" value={String(tables.filter((table) => table.status !== 'Available').length)} trend="+3" accent="blue" />
        <StatCard label="Customers" value="183" trend="+23" accent="green" />
      </div>

      <div className="analytics-grid">
        <div className="glass-card chart-panel">
          <h3>Orders by hour</h3>
          <div className="bar-chart small">
            {[45, 68, 80, 58, 90, 120, 96].map((value, index) => (
              <div key={index} className="bar-col">
                <span style={{ height: `${value}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card chart-panel">
          <h3>Revenue</h3>
          <div className="line-graph">
            <span className="line" />
          </div>
        </div>

        <div className="glass-card chart-panel">
          <h3>Popular dishes</h3>
          <ul className="mini-list">
            {foods.slice(0, 4).map((food) => (
              <li key={food.id}><span>{food.name}</span><strong>{food.reviews}</strong></li>
            ))}
          </ul>
        </div>

        <div className="glass-card chart-panel">
          <h3>Service requests</h3>
          <ul className="mini-list">
            {serviceRequests.slice(0, 3).map((request) => (
              <li key={request.id}><span>{request.type}</span><strong>{request.status}</strong></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="glass-card">
          <h3>Recent orders</h3>
          <table className="data-table compact">
            <thead>
              <tr><th>ID</th><th>Table</th><th>Status</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id}><td>{order.id}</td><td>{order.tableNumber}</td><td>{order.status}</td><td>₹{order.amount}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card">
          <h3>Average Rating</h3>
          <div className="rating-figure">{avgRating}<span>/5</span></div>
          <div className="stars">⭐⭐⭐⭐⭐</div>
        </div>
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 16. ADMIN ORDERS
 * =============================================================================
 */
function AdminOrdersPage({
  orders,
  setOrders,
  theme,
  setTheme,
}: {
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  return (
    <AdminLayout title="Orders" theme={theme} setTheme={setTheme}>
      <div className="glass-card panel-box">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Table</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.tableNumber}</td>
                <td>{order.customer}</td>
                <td>{order.items.map((item) => `${item.quantity} × ${item.name}`).join(', ')}</td>
                <td>₹{order.amount}</td>
                <td>{order.createdAt}</td>
                <td>
                  <select value={order.status} onChange={(event) => setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: event.target.value as OrderStatus } : item))}>
                    {['Received', 'Preparing', 'Ready', 'Served', 'Cancelled'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 17. ADMIN KITCHEN
 * =============================================================================
 */
function AdminKitchenPage({
  orders,
  setOrders,
  theme,
  setTheme,
}: {
  orders: Order[]
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  const handleNextStatus = (orderId: string, currentStatus: OrderStatus) => {
    const stepMap: OrderStatus[] = ['Received', 'Preparing', 'Ready', 'Served']
    const index = stepMap.indexOf(currentStatus)
    const nextStatus = index < stepMap.length - 1 ? stepMap[index + 1] : 'Served'
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)))
  }

  return (
    <AdminLayout title="Kitchen" theme={theme} setTheme={setTheme}>
      <div className="kitchen-grid">
        {orders.map((order) => (
          <div key={order.id} className="glass-card kitchen-card">
            <div className="kitchen-header">
              <h3>TABLE {order.tableNumber}</h3>
              <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>

            <ul>
              {order.items.map((item) => (
                <li key={`${order.id}-${item.name}`}>{item.quantity} × {item.name}</li>
              ))}
            </ul>

            <button type="button" className="primary-button full-width" onClick={() => handleNextStatus(order.id, order.status)}>
              {order.status === 'Received' ? 'Start Preparing' : order.status === 'Preparing' ? 'Mark Ready' : 'Served'}
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 18. ADMIN MENU
 * =============================================================================
 */
function AdminMenuPage({
  foods,
  setFoods,
  theme,
  setTheme,
}: {
  foods: Food[]
  setFoods: React.Dispatch<React.SetStateAction<Food[]>>
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  const [form, setForm] = useState<Food | null>(null)

  return (
    <AdminLayout title="Menu" theme={theme} setTheme={setTheme}>
      <div className="admin-menu-layout">
        <div className="glass-card panel-box">
          <div className="panel-head">
            <h3>Menu Items</h3>
            <button type="button" className="primary-button" onClick={() => setForm({ ...initialFoods[0], id: `food-${Date.now()}`, name: 'New Food' })}>Add Food</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food.id}>
                  <td>{food.name}</td>
                  <td>₹{food.price}</td>
                  <td>{food.category}</td>
                  <td>{food.availability}</td>
                  <td>
                    <button type="button" className="text-button" onClick={() => setForm(food)}>Edit</button>
                    <button type="button" className="text-button" onClick={() => setFoods((current) => current.filter((item) => item.id !== food.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {form ? (
          <div className="glass-card panel-box editor-box">
            <h3>{form.id.startsWith('food-') && form.name === 'New Food' ? 'Add Menu Item' : 'Edit Food'}</h3>
            <div className="editor-grid">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Food Name" />
              <input value={form.price} type="number" onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} placeholder="Price" />
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" />
              <input value={form.calories} onChange={(event) => setForm({ ...form, calories: event.target.value })} placeholder="Calories" />
              <input value={form.allergens} onChange={(event) => setForm({ ...form, allergens: event.target.value })} placeholder="Allergens" />
              <input value={form.spiceLevel} onChange={(event) => setForm({ ...form, spiceLevel: event.target.value })} placeholder="Spice Level" />
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
              <textarea value={form.ingredients.join(', ')} onChange={(event) => setForm({ ...form, ingredients: event.target.value.split(',').map((item) => item.trim()) })} placeholder="Ingredients" />
            </div>

            <div className="panel-actions">
              <button type="button" className="secondary-button" onClick={() => setForm(null)}>Cancel</button>
              <button type="button" className="primary-button" onClick={() => {
                setFoods((current) => {
                  const exists = current.some((item) => item.id === form.id)
                  if (exists) {
                    return current.map((item) => (item.id === form.id ? form : item))
                  }
                  return [form, ...current]
                })
                setForm(null)
              }}>Save</button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 19. ADMIN 3D MODELS
 * =============================================================================
 */
function AdminModelsPage({
  foods,
  theme,
  setTheme,
}: {
  foods: Food[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  return (
    <AdminLayout title="3D Food Models" theme={theme} setTheme={setTheme}>
      <div className="glass-card panel-box">
        <table className="data-table">
          <thead>
            <tr>
              <th>Food</th>
              <th>3D Model</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id}>
                <td>{food.name}</td>
                <td>{food.model ? 'Uploaded' : 'Fallback Image'}</td>
                <td>{food.model ? 'Ready' : 'Missing'}</td>
                <td>Today</td>
                <td><button className="text-button" type="button">Preview</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 20. ADMIN TABLES
 * =============================================================================
 */
function AdminTablesPage({
  tables,
  setTables,
  serviceRequests,
  theme,
  setTheme,
}: {
  tables: TableInfo[]
  setTables: React.Dispatch<React.SetStateAction<TableInfo[]>>
  serviceRequests: ServiceRequest[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  return (
    <AdminLayout title="Tables" theme={theme} setTheme={setTheme}>
      <div className="table-grid">
        {tables.map((table) => (
          <div key={table.id} className="glass-card table-card">
            <div className="kitchen-header">
              <h3>Table {table.number}</h3>
              <span className={`status-badge ${table.status.toLowerCase().replace(/\s+/g, '-')}`}>{table.status}</span>
            </div>
            <p>{serviceRequests.filter((entry) => entry.tableNumber === table.number).length} service requests</p>
            <button type="button" className="secondary-button full-width" onClick={() => setTables((current) => current.map((entry) => entry.id === table.id ? { ...entry, status: entry.status === 'Available' ? 'Occupied' : 'Available' } : entry))}>
              Toggle Status
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 21. ADMIN QR CODES
 * =============================================================================
 */
function AdminQRPage({
  tables,
  theme,
  setTheme,
}: {
  tables: TableInfo[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  return (
    <AdminLayout title="QR Codes" theme={theme} setTheme={setTheme}>
      <div className="qr-grid">
        {tables.map((table) => (
          <div key={table.id} className="glass-card qr-card">
            <h3>Table {table.number}</h3>
            <QRCodeCanvas value={`http://localhost:5173/menu/restaurant-demo/table/${table.number}`} size={150} />
            <div className="qr-actions">
              <button type="button" className="secondary-button small-button">Generate</button>
              <button type="button" className="secondary-button small-button">Download</button>
              <button type="button" className="secondary-button small-button">Print</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 22. ADMIN OFFERS
 * =============================================================================
 */
function AdminOffersPage({
  offers,
  setOffers,
  theme,
  setTheme,
}: {
  offers: Offer[]
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  return (
    <AdminLayout title="Offers" theme={theme} setTheme={setTheme}>
      <div className="glass-card panel-box">
        <table className="data-table">
          <thead>
            <tr><th>Offer</th><th>Discount</th><th>Start</th><th>End</th><th>Active</th></tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.name}</td>
                <td>{offer.discount}</td>
                <td>{offer.startDate}</td>
                <td>{offer.endDate}</td>
                <td>
                  <button type="button" className="text-button" onClick={() => setOffers((current) => current.map((item) => item.id === offer.id ? { ...item, active: !item.active } : item))}>
                    {offer.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 23. ADMIN REVIEWS
 * =============================================================================
 */
function AdminReviewsPage({
  reviews,
  theme,
  setTheme,
}: {
  reviews: ReviewItem[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  return (
    <AdminLayout title="Reviews" theme={theme} setTheme={setTheme}>
      <div className="reviews-grid">
        {reviews.map((review) => (
          <div key={review.id} className="glass-card review-card">
            <div className="review-topline">
              <strong>{review.customer}</strong>
              <span>{review.rating} ⭐</span>
            </div>
            <p>{review.food}</p>
            <blockquote>{review.comment}</blockquote>
            <small>{review.date}</small>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 24. ADMIN ANALYTICS
 * =============================================================================
 */
function AdminAnalyticsPage({
  foods,
  orders,
  theme,
  setTheme,
}: {
  foods: Food[]
  orders: Order[]
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)

  return (
    <AdminLayout title="Analytics" theme={theme} setTheme={setTheme}>
      <div className="stats-grid">
        <StatCard label="Revenue" value={`₹${totalRevenue}`} trend="+16%" accent="rose" />
        <StatCard label="Orders" value={String(orders.length)} trend="+9%" accent="gold" />
        <StatCard label="Avg Order Value" value={`₹${Math.round(totalRevenue / orders.length)}`} trend="+4%" accent="blue" />
        <StatCard label="Peak Time" value="7:30 PM" trend="Busy" accent="green" />
      </div>

      <div className="analytics-grid">
        <div className="glass-card chart-panel">
          <h3>Revenue by day</h3>
          <div className="bar-chart small">
            {[32, 48, 44, 59, 70, 62, 80].map((value, index) => (
              <div key={index} className="bar-col"><span style={{ height: `${value}%` }} /></div>
            ))}
          </div>
        </div>

        <div className="glass-card chart-panel">
          <h3>Top foods</h3>
          <ul className="mini-list">
            {foods.slice(0, 5).map((food) => (
              <li key={food.id}><span>{food.name}</span><strong>{food.rating}</strong></li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 25. ADMIN SETTINGS
 * =============================================================================
 */
function AdminSettingsPage({
  theme,
  setTheme,
}: {
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}) {
  return (
    <AdminLayout title="Settings" theme={theme} setTheme={setTheme}>
      <div className="glass-card panel-box settings-panel">
        <label><input type="checkbox" defaultChecked /> Multi-location support</label>
        <label><input type="checkbox" defaultChecked /> Real-time kitchen updates</label>
        <label><input type="checkbox" defaultChecked /> Digital bill notifications</label>
        <label><input type="checkbox" defaultChecked /> 3D model fallback behavior</label>
      </div>
    </AdminLayout>
  )
}

/* =============================================================================
 * 26. SHARED COMPONENTS
 * =============================================================================
 */
function StatCard({
  label,
  value,
  trend,
  accent,
}: {
  label: string
  value: string
  trend: string
  accent: 'gold' | 'rose' | 'blue' | 'green'
}) {
  return (
    <div className="glass-card stat-card">
      <span className="stat-label">{label}</span>
      <strong className={`stat-value ${accent}`}>{value}</strong>
      <small>{trend}</small>
    </div>
  )
}

export default App