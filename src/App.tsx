/* =============================================================================
 * 1. IMPORTS — every external library used by the app
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

const initialFoods: Food[] = [
  {
    id: 'tikka-pizza',
    name: ' Tikka Pizza',
    category: 'Pizza',
    price: 349,
    rating: 4.8,
    description: 'Cheesy pizza topped with grilled chicken tikka, herbs and fresh vegetables.',
    ingredients: ['Pizza base', 'Cheese', 'Chicken tikka', 'Capsicum', 'Onion', 'Tomato', 'Herbs'],
    calories: '620 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Medium',
    servingSize: '1 pizza',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    model: '/models/Sicilian_Pizza.glb',
    isVeg: false,
    bestseller: true,
    availability: 'Available',
    reviews: 314,
  },
  {
    id: 'cheese-burger',
    name: 'Cheese Burger',
    category: 'Burgers',
    price: 219,
    rating: 4.7,
    description: 'Juicy grilled patty layered with cheddar, lettuce and burger sauce.',
    ingredients: ['Bun', 'Beef patty', 'Cheddar', 'Lettuce', 'Onion', 'Sauce'],
    calories: '540 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 burger',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    model: '/models/Cheese_Burger.glb',
    isVeg: false,
    bestseller: true,
    availability: 'Popular',
    reviews: 267,
  },
  {
    id: 'cheese-pasta',
    name: 'Cheese Pasta',
    category: 'Pasta',
    price: 289,
    rating: 4.9,
    description: 'Creamy al dente pasta with melted cheese and roasted garlic finish.',
    ingredients: ['Pasta', 'Cream', 'Cheese', 'Garlic', 'Parsley'],
    calories: '580 kcal',
    allergens: 'Gluten, Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 bowl',
    image:
      'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=900&q=80',
    model: '/models/pasta.glb',
    isVeg: true,
    bestseller: true,
    availability: 'Available',
    reviews: 402,
  },
  {
    id: 'paneer-tikka',
    name: 'Paneer Tikka',
    category: 'Indian Food',
    price: 259,
    rating: 4.6,
    description: 'Smoky grilled cottage cheese marinated in house spices and herbs.',
    ingredients: ['Paneer', 'Yogurt', 'Capsicum', 'Onion', 'Masala'],
    calories: '430 kcal',
    allergens: 'Dairy',
    spiceLevel: 'Medium',
    servingSize: '2 servings',
    image:
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
    model: '/models/Paneer_Tikka.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 189,
  },
  {
    id: 'peri-peri-wings',
    name: 'Peri Peri Wings',
    category: 'Snacks',
    price: 199,
    rating: 4.7,
    description: 'Crispy chicken wings glazed with spicy peri peri sauce and lemon zest.',
    ingredients: ['Chicken', 'Peri peri', 'Lemon', 'Garlic', 'Seasoning'],
    calories: '510 kcal',
    allergens: 'Dairy',
    spiceLevel: 'Spicy',
    servingSize: '6 pieces',
    image:
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80',
    model: '/models/peri_peri_wings.glb',
    isVeg: false,
    availability: 'Popular',
    reviews: 221,
  },
  {
    id: 'lava-cake',
    name: 'Molten Lava Cake',
    category: 'Desserts',
    price: 169,
    rating: 4.9,
    description: 'Warm chocolate cake with a rich molten center and vanilla cream.',
    ingredients: ['Chocolate', 'Butter', 'Flour', 'Eggs', 'Vanilla'],
    calories: '460 kcal',
    allergens: 'Gluten, Dairy, Eggs',
    spiceLevel: 'Mild',
    servingSize: '1 slice',
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
    model: '/models/Salted_Caramel.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 284,
  },
  {
    id: 'choco-burst-icecream',
    name: 'Choco Burst Ice Cream',
    category: 'Ice Cream',
    price: 149,
    rating: 4.8,
    description: 'Velvety chocolate ice cream with crunchy praline and cocoa nibs.',
    ingredients: ['Milk', 'Chocolate', 'Cream', 'Praline', 'Cocoa'],
    calories: '340 kcal',
    allergens: 'Dairy',
    spiceLevel: 'Mild',
    servingSize: '1 scoop',
    image:
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=900&q=80',
    model: '',
    isVeg: true,
    availability: 'Available',
    reviews: 178,
  },
  {
    id: 'mango-smoothie',
    name: 'Mango Smoothie',
    category: 'Smoothies',
    price: 149,
    rating: 4.6,
    description: 'A creamy blend of ripe mango, yogurt and coconut for a tropical lift.',
    ingredients: ['Mango', 'Yogurt', 'Coconut', 'Honey'],
    calories: '260 kcal',
    allergens: 'Dairy',
    spiceLevel: 'Mild',
    servingSize: '300 ml',
    image:
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80',
    model: '/models/Tropical_Fruit_Smoothie.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 143,
  },
  {
    id: 'cold-coffee',
    name: 'Cold Coffee',
    category: 'Drinks',
    price: 120,
    rating: 4.5,
    description: 'Iced coffee blended with creamy milk and a touch of caramel.',
    ingredients: ['Coffee', 'Milk', 'Ice', 'Caramel'],
    calories: '200 kcal',
    allergens: 'Dairy',
    spiceLevel: 'Mild',
    servingSize: '250 ml',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
    model: '/models/cold_coffee.glb',
    isVeg: true,
    availability: 'Available',
    reviews: 95,
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
      { foodId: 'chicken-tikka-pizza', name: 'Chicken Tikka Pizza', quantity: 1, price: 349, customizations: { size: 'Large', toppings: ['Extra Cheese'], spice: 'Medium' } },
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
  { id: 'rv-1', customer: 'Aanya', food: 'Chicken Tikka Pizza', rating: 5, comment: 'The flavors were incredible and the 3D preview made it easy to pick.', date: 'Today' },
  { id: 'rv-2', customer: 'Rohan', food: 'Cheese Pasta', rating: 5, comment: 'Creamy and comforting, definitely order again.', date: 'Yesterday' },
  { id: 'rv-3', customer: 'Neha', food: 'Cold Coffee', rating: 4, comment: 'Tasted good and the order arrived quick.', date: 'Recently' },
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
 * 5. APP — top-level component
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
    const customizationFee = customizations.toppings.reduce((sum, topping) => sum + getToppingPrice(topping), 0)
    const itemPrice = food.price + customizationFee

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
            {/* NEW: prompt() pop-up for keyword search */}
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
 * 7. FOOD DETAIL PAGE
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
  const [size, setSize] = useState('Medium')
  const [toppings, setToppings] = useState<string[]>(['Extra Cheese'])
  const [spice, setSpice] = useState('Medium')
  const [quantity, setQuantity] = useState(1)

  const basePrice = food.price
  const extraCharge = toppings.reduce((sum, topping) => sum + getToppingPrice(topping), 0)
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
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

            <div className="customizer-group">
              <label>Size</label>
              <div className="radio-list">
                {['Small', 'Medium', 'Large'].map((option) => (
                  <label key={option} className={size === option ? 'choice selected' : 'choice'}>
                    <input type="radio" name="size" checked={size === option} onChange={() => setSize(option)} />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="customizer-group">
              <label>Toppings</label>
              <div className="check-list">
                {['Extra Cheese', 'Mushroom', 'Chicken', 'Jalapeno'].map((option) => (
                  <label key={option} className={toppings.includes(option) ? 'choice selected' : 'choice'}>
                    <input type="checkbox" checked={toppings.includes(option)} onChange={() => toggleTopping(option)} />
                    {option} +₹{getToppingPrice(option)}
                  </label>
                ))}
              </div>
            </div>

            <div className="customizer-group">
              <label>Spice</label>
              <div className="radio-list">
                {['Mild', 'Medium', 'Spicy'].map((option) => (
                  <label key={option} className={spice === option ? 'choice selected' : 'choice'}>
                    <input type="radio" name="spice" checked={spice === option} onChange={() => setSpice(option)} />
                    {option}
                  </label>
                ))}
              </div>
            </div>

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
                      {/* NEW: confirm() pop-up before removing */}
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
      style={{ width: '100%', height: '100%', minHeight: 280 }}
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

/* =============================================================================
 * 27. HELPERS
 * =============================================================================
 */
function getToppingPrice(option: string) {
  const prices: Record<string, number> = {
    'Extra Cheese': 30,
    Mushroom: 40,
    Chicken: 60,
    Jalapeno: 20,
  }
  return prices[option] ?? 0
}

export default App