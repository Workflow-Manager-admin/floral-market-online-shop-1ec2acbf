import React, { useState, useMemo, createContext } from "react";

// Dummy flower product data
const FLOWERS = [
  {
    id: 1,
    name: "Lavender Dreams",
    price: 24.99,
    description: "A soothing bouquet of fresh lavender and green accents.",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=320&q=80",
    type: "bouquet",
    color: "purple",
    occasion: "all",
  },
  {
    id: 2,
    name: "Rose Romance",
    price: 34.99,
    description: "Classic long-stemmed red roses for true romantics.",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=320&q=80",
    type: "bouquet",
    color: "red",
    occasion: "romantic",
  },
  {
    id: 3,
    name: "Sunny Delight",
    price: 19.95,
    description: "Bright sunflowers and cheerful yellow blooms.",
    img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=320&q=80",
    type: "bouquet",
    color: "yellow",
    occasion: "cheer",
  },
  {
    id: 4,
    name: "Garden Gala",
    price: 29.5,
    description: "A colorful arrangement of garden-fresh mixed flowers.",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=facearea&w=320&q=80",
    type: "bouquet",
    color: "multicolor",
    occasion: "birthday",
  },
  {
    id: 5,
    name: "Pure Elegance",
    price: 28.75,
    description: "Lily and white rose bouquet, perfect for elegance.",
    img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=facearea&w=320&q=80",
    type: "bouquet",
    color: "white",
    occasion: "all",
  },
  {
    id: 6,
    name: "Pink Peony Bliss",
    price: 32.50,
    description: "Luxurious pink peonies with subtle greens.",
    img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3747?auto=format&fit=facearea&w=320&q=80",
    type: "bouquet",
    color: "pink",
    occasion: "anniversary",
  },
];

// Create contexts for authentication and cart state
export const AuthContext = createContext();
export const CartContext = createContext();

const getUserInit = () =>
  JSON.parse(localStorage.getItem("flower_user")) || null;
const getOrdersInit = () =>
  JSON.parse(localStorage.getItem("flower_orders")) || [];

function App() {
  // State: Authentication
  const [user, setUser] = useState(getUserInit());
  const [authView, setAuthView] = useState("login"); // or "signup"
  // State: Cart
  const [cart, setCart] = useState([]);
  // State: Cart Modal
  const [cartOpen, setCartOpen] = useState(false);
  // State: Product detail modal
  const [showProduct, setShowProduct] = useState(null); // flower obj
  // State: Routing - 'shop' | 'orders' | 'checkout' | 'login'
  const [route, setRoute] = useState("shop");
  // State: Filters and search
  const [filter, setFilter] = useState({
    search: "",
    color: "",
    occasion: "",
  });
  // State: Fake persistent order data
  const [orders, setOrders] = useState(getOrdersInit());

  // Save user and orders on change
  React.useEffect(() => {
    if (user) {
      localStorage.setItem("flower_user", JSON.stringify(user));
    }
  }, [user]);
  React.useEffect(() => {
    localStorage.setItem("flower_orders", JSON.stringify(orders));
  }, [orders]);

  // Authentication Handlers
  const handleLogin = (username, password) => {
    // For demonstration ONLY, any user logs in, password is ignored
    setUser({ username });
    setRoute("shop");
  };
  const handleSignup = (username, password) => {
    // For demo, just register the user
    setUser({ username });
    setRoute("shop");
  };
  const handleLogout = () => {
    setUser(null);
    setOrders([]);
    localStorage.removeItem("flower_user");
    localStorage.removeItem("flower_orders");
    setRoute("login");
  };

  // Cart Handlers
  const handleAddToCart = (product, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].qty += qty;
        return updated;
      } else {
        return [...prev, { ...product, qty }];
      }
    });
    setCartOpen(true);
  };
  const handleRemoveFromCart = (productId) =>
    setCart((prev) => prev.filter((c) => c.id !== productId));
  const handleUpdateQty = (productId, newQty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, qty: newQty } : item
      )
    );
  };
  const handleClearCart = () => setCart([]);
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2),
    [cart]
  );

  // Product Modal Handlers
  const openProductDetail = (product) => setShowProduct(product);
  const closeProductDetail = () => setShowProduct(null);

  // Orders
  const handleCheckout = (address) => {
    if (!cart.length) return false;
    const now = new Date();
    setOrders((prev) => [
      ...prev,
      {
        id: "O" + now.getTime(),
        date: now.toISOString(),
        items: cart,
        total: cartTotal,
        address,
      },
    ]);
    setCart([]);
    setCartOpen(false);
    setRoute("orders");
    return true;
  };

  // Routing: Only allow "shop", "orders", "checkout"
  let mainView = null;
  if (!user) {
    mainView = (
      <AuthPage
        mode={authView}
        onSwitch={() => setAuthView((m) => (m === "login" ? "signup" : "login"))}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  } else if (route === "orders") {
    mainView = <OrderHistoryPage orders={orders} onBack={() => setRoute("shop")} />;
  } else if (route === "checkout") {
    mainView = (
      <CheckoutPage
        cart={cart}
        onConfirm={handleCheckout}
        onCancel={() => setRoute("shop")}
      />
    );
  } else {
    mainView = (
      <main className="main-shop-grid">
        <SidebarFilter
          filter={filter}
          setFilter={setFilter}
        />
        <ProductListPage
          products={FLOWERS}
          filter={filter}
          onAddToCart={handleAddToCart}
          onViewProduct={openProductDetail}
        />
      </main>
    );
  }

  return (
    <AuthContext.Provider value={{ user, handleLogout }}>
      <CartContext.Provider
        value={{
          cart,
          handleAddToCart,
          handleRemoveFromCart,
          handleUpdateQty,
          handleClearCart,
        }}
      >
        <div className="app-root">
          <Header
            active={route}
            onNav={setRoute}
            cartCount={cartCount}
            onCart={() => setCartOpen(true)}
            user={user}
            onLogout={handleLogout}
          />
          {mainView}

          <Footer />
          {cartOpen && (
            <CartModal
              cart={cart}
              onClose={() => setCartOpen(false)}
              onCheckout={() => setRoute("checkout")}
              onRemove={handleRemoveFromCart}
              onUpdateQty={handleUpdateQty}
              cartTotal={cartTotal}
            />
          )}
          {showProduct && (
            <ProductDetailModal
              product={showProduct}
              onClose={closeProductDetail}
              onAddToCart={() => {
                handleAddToCart(showProduct, 1);
                closeProductDetail();
              }}
            />
          )}
        </div>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

/** HEADER COMPONENT */
function Header({ active, onNav, cartCount, onCart, user, onLogout }) {
  return (
    <header className="flower-header" role="banner">
      <a className="flower-logo" href="/" onClick={e => {e.preventDefault(); onNav('shop')}}>
        floral.market
      </a>
      <nav className="header-nav" aria-label="Primary nav">
        <a
          href="/"
          className={active === "shop" ? "active" : ""}
          onClick={e => { e.preventDefault(); onNav("shop"); }}
        >Shop</a>
        {user && (
          <a
            href="/orders"
            className={active === "orders" ? "active" : ""}
            onClick={e => {e.preventDefault(); onNav("orders");}}
          >My Orders</a>
        )}
      </nav>
      <div className="header-actions">
        {user && (
          <>
            <button className="cart-button" onClick={onCart} aria-label="Open cart">
              <span>🛒</span>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <button
              className="btn btn-secondary"
              style={{marginLeft: 6}}
              onClick={onLogout}
            >Logout</button>
          </>
        )}
      </div>
    </header>
  );
}

/** SIDEBAR FILTER COMPONENT */
function SidebarFilter({ filter, setFilter }) {
  // Collect unique color and occasion
  const colors = ["red", "yellow", "pink", "white", "purple", "multicolor"];
  const occasions = [
    { value: "", label: "-- Any Occasion --" },
    { value: "birthday", label: "Birthday" },
    { value: "romantic", label: "Romantic" },
    { value: "cheer", label: "Cheer Someone" },
    { value: "anniversary", label: "Anniversary" },
    { value: "all", label: "All Purpose" },
  ];

  return (
    <aside className="sidebar" aria-label="Sidebar filters">
      <input
        type="search"
        placeholder="Search flowers…"
        value={filter.search}
        aria-label="Search flowers"
        onChange={(e) =>
          setFilter((prev) => ({ ...prev, search: e.target.value }))
        }
      />
      <div className="filter-section">
        <h3>Filter by Color</h3>
        {colors.map((color) => (
          <label key={color}>
            <input
              type="checkbox"
              checked={filter.color === color}
              onChange={() =>
                setFilter((prev) => ({
                  ...prev,
                  color: prev.color === color ? "" : color,
                }))
              }
              aria-checked={filter.color === color}
              aria-label={color.charAt(0).toUpperCase() + color.slice(1)}
            />
            <span style={{
              display: "inline-block",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              margin: "0 7px 0 7px",
              background:
                color === "red"
                  ? "#D32F2F"
                  : color === "yellow"
                  ? "#ffd800"
                  : color === "pink"
                  ? "#f883c7"
                  : color === "white"
                  ? "#fff"
                  : color === "purple"
                  ? "#b54bc3"
                  : "#adadad",
              border: "1px solid #dedede",
              verticalAlign: 'text-bottom'
            }} /> {color.charAt(0).toUpperCase()+color.slice(1)}
          </label>
        ))}
      </div>
      <div className="filter-section">
        <h3>Occasion</h3>
        <select
          value={filter.occasion}
          onChange={e =>
            setFilter((prev) => ({
              ...prev,
              occasion: e.target.value
            }))
          }
          aria-label="Select Occasion"
        >
          {occasions.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}
        </select>
      </div>
    </aside>
  );
}

/** PRODUCT LIST COMPONENT */
function ProductListPage({ products, filter, onAddToCart, onViewProduct }) {
  // Filter/search logic
  const filtered = useMemo(() => {
    return products.filter(f => {
      if (
        filter.search &&
        !(
          f.name.toLowerCase().includes(filter.search.toLowerCase()) ||
          f.description.toLowerCase().includes(filter.search.toLowerCase())
        )
      )
        return false;
      if (filter.color && f.color !== filter.color) return false;
      if (filter.occasion && filter.occasion !== "" && f.occasion !== filter.occasion) return false;
      return true;
    });
  }, [products, filter]);
  // Simple pagination (if many)
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(filtered.length / pageSize);

  const renderGrid = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="product-listing-container">
      <div className="products-grid">
        {renderGrid.length === 0 ? (
          <div style={{ gridColumn: "1/-1", color: "#ccc", fontSize: 20, padding: 48 }}>No products found.</div>
        ) : (
          renderGrid.map((f) => (
            <div className="product-card" key={f.id}>
              <img src={f.img} alt={f.name} className="product-img" />
              <div className="product-name">{f.name}</div>
              <div className="product-price">${f.price.toFixed(2)}</div>
              <div className="product-desc-sm">{f.description.slice(0, 54)}…</div>
              <button className="btn" onClick={() => onAddToCart(f, 1)}>
                Add to cart
              </button>
              <button
                className="btn btn-secondary"
                style={{marginTop:"0.7rem"}}
                onClick={() => onViewProduct(f)}
              >
                View details
              </button>
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
            <button
              className={`pagination-btn${page === num ? " active" : ""}`}
              key={num}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** CART MODAL COMPONENT */
function CartModal({ cart, onClose, onCheckout, onRemove, onUpdateQty, cartTotal }) {
  return (
    <div className="flower-modal-bg" tabIndex={-1} aria-modal="true" role="dialog" aria-label="Shopping Cart">
      <div className="flower-modal" style={{ minWidth: 370 }}>
        <button className="flower-modal-close" aria-label="Close cart" onClick={onClose}>✕</button>
        <div className="cart-modal-title">Your Cart</div>
        <div className="cart-modal-items">
          {cart.length === 0 ? (
            <div>No items in cart.</div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                <img src={item.img} className="cart-item-img" alt={item.name} />
                <div className="cart-item-details">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-qty">
                    <span>Qty:&nbsp;</span>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={item.qty}
                      style={{ width: "40px", fontSize: "1rem", marginRight: 4 }}
                      onChange={e => onUpdateQty(item.id, parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                </div>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>${(item.price*item.qty).toFixed(2)}</span>
                <button className="cart-item-remove" aria-label="Remove item" onClick={() => onRemove(item.id)}>✖️</button>
              </div>
            ))
          )}
        </div>
        <div className="cart-summary">
          <div className="cart-summary-label">Total</div>
          <div className="cart-summary-value">${cartTotal}</div>
        </div>
        <div className="cart-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button
            className="btn btn-accent"
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

/** PRODUCT DETAIL MODAL */
function ProductDetailModal({ product, onClose, onAddToCart }) {
  return (
    <div className="flower-modal-bg flower-detail-modal" tabIndex={-1} aria-modal="true" role="dialog" aria-label="Flower details">
      <div className="flower-modal flower-detail-modal-inner">
        <button className="flower-modal-close" aria-label="Close" onClick={onClose}>✕</button>
        <img src={product.img} alt={product.name} className="flower-detail-img" />
        <div className="flower-detail-content">
          <div className="flower-detail-title">{product.name}</div>
          <div className="flower-detail-description">{product.description}</div>
          <div className="flower-detail-price">${product.price.toFixed(2)}</div>
          <button className="btn btn-accent" style={{marginTop: 18}} onClick={onAddToCart}>Add to cart</button>
        </div>
      </div>
    </div>
  );
}

/** AUTH PAGE COMPONENT */
function AuthPage({ mode, onSwitch, onLogin, onSignup }) {
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    if (mode === "login") {
      onLogin(username, pw);
    } else {
      onSignup(username, pw);
    }
  }
  return (
    <div className="auth-container">
      <div className="auth-title">
        {mode === "login" ? "Login to Your Account" : "Create Account"}
      </div>
      <form onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="auth-user">Username</label>
        <input className="auth-input" id="auth-user" type="text" value={username} required autoFocus onChange={e => setUsername(e.target.value)} />
        <label className="auth-label" htmlFor="auth-pw">Password</label>
        <input className="auth-input" id="auth-pw" type="password" value={pw} required onChange={e => setPw(e.target.value)} />
        <button className="auth-btn" type="submit">
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>
      <div className="auth-switch" onClick={onSwitch} role="button" tabIndex={0}>
        {mode === "login"
          ? "Don't have an account? Create one"
          : "Already have an account? Log in"}
      </div>
    </div>
  );
}

/** CHECKOUT PAGE COMPONENT */
function CheckoutPage({ cart, onConfirm, onCancel }) {
  // For brevity, single address field and basic validation
  const [address, setAddress] = useState("");
  const [confirming, setConfirming] = useState(false);
  function handleCheckout(e) {
    e.preventDefault();
    setConfirming(true);
    setTimeout(() => {
      if (onConfirm(address)) {
        setConfirming(false);
      } else {
        setConfirming(false);
      }
    }, 650);
  }
  const total =
    cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);
  return (
    <div className="auth-container" style={{marginTop: 38, maxWidth: 400}}>
      <div className="auth-title">Checkout</div>
      <form onSubmit={handleCheckout}>
        <h4 style={{textAlign: "left", color: "#b54bc3", margin: 0}}>Shipping Address</h4>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{width: "100%", fontSize: 17, marginTop: 12, minHeight: 46, borderRadius:7, border:'1.2px solid #ebebeb'}}
          required
        />
        <h4 style={{textAlign: "left", color: "#D32F2F"}}>Order Summary</h4>
        <ul>
          {cart.map(item =>
            <li key={item.id} style={{marginBottom:2}}>
              {item.qty} × {item.name} <span style={{color:'#bbb'}}>(${item.price.toFixed(2)})</span>
            </li>
          )}
        </ul>
        <div className="cart-summary" style={{marginTop:'.6rem'}}>Total: <span className="cart-summary-value">${total}</span></div>
        <div className="cart-actions" style={{justifyContent:'center', marginTop: "1.15rem"}}>
          <button type="button" className="btn btn-secondary" style={{minWidth:82}} onClick={onCancel}>Cancel</button>
          <button className="btn btn-accent" style={{minWidth:90}} disabled={confirming || !cart.length}>
            {confirming ? "Placing…" : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

/** ORDER HISTORY PAGE */
function OrderHistoryPage({ orders, onBack }) {
  return (
    <div className="order-history-wrap">
      <div className="order-history-title">Order History</div>
      {orders.length === 0 ? (
        <div>No orders yet.</div>
      ) : (
        orders
          .slice()
          .reverse()
          .map((o) => (
            <div className="order-row" key={o.id}>
              <span className="order-date">
                {new Date(o.date).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="order-flowers">
                {o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}
              </span>
              <span className="order-total">
                Total: ${o.total}
              </span>
              <span style={{color:"#bbb", fontSize:12}}>{o.address}</span>
            </div>
          ))
      )}
      <div className="cart-actions" style={{marginTop:17}}>
        <button className="btn btn-accent" onClick={onBack}>Back to Shop</button>
      </div>
    </div>
  );
}

/** FOOTER COMPONENT */
function Footer() {
  return (
    <footer className="flower-footer">
      &copy; {new Date().getFullYear()} floral.market &nbsp;|&nbsp; The modern minimal online flower shop
    </footer>
  );
}

export default App;
