/**
 * Smart Canteen — Data Store
 * localStorage-backed data layer for the Smart Canteen demo.
 * All data persists across page refreshes.
 */

(function () {
  'use strict';

  /* ───────── Storage keys ───────── */
  const KEYS = {
    menu: 'sc_menu',
    orders: 'sc_orders',
    users: 'sc_users',
    cart: 'sc_cart',
    init: 'sc_initialized',
    auth: 'sc_current_user',       // sessionStorage
    orderSeq: 'sc_order_seq'
  };

  /* ───────── Sample seed data ───────── */
  const SAMPLE_MENU = [
    { id: 'item-1', name: 'Masala Dosa', description: 'Crispy golden dosa filled with spiced potato masala, served with sambar and coconut chutney', category: 'Breakfast', price: 60, veg: true, available: true, emoji: '🫓', gradient: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', stock: 25 },
    { id: 'item-2', name: 'Idli (2 pcs)', description: 'Soft steamed rice cakes served with sambar and chutneys', category: 'Breakfast', price: 35, veg: true, available: true, emoji: '🍚', gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', stock: 30 },
    { id: 'item-3', name: 'Veg Sandwich', description: 'Grilled sandwich with fresh vegetables, cheese, and mint chutney', category: 'Snacks', price: 50, veg: true, available: true, emoji: '🥪', gradient: 'linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%)', stock: 20 },
    { id: 'item-4', name: 'Paneer Roll', description: 'Flaky paratha wrapped around spicy paneer filling with onions and peppers', category: 'Snacks', price: 80, veg: true, available: true, emoji: '🌯', gradient: 'linear-gradient(135deg, #FED7AA 0%, #FB923C 100%)', stock: 15 },
    { id: 'item-5', name: 'Veg Fried Rice', description: 'Fragrant rice wok-tossed with mixed vegetables, soy sauce, and aromatic spices', category: 'Lunch', price: 90, veg: true, available: true, emoji: '🍛', gradient: 'linear-gradient(135deg, #BBF7D0 0%, #4ADE80 100%)', stock: 20 },
    { id: 'item-6', name: 'Chicken Biryani', description: 'Aromatic basmati rice layered with tender chicken pieces and rich spices', category: 'Lunch', price: 140, veg: false, available: true, emoji: '🍗', gradient: 'linear-gradient(135deg, #FECACA 0%, #F87171 100%)', stock: 15 },
    { id: 'item-7', name: 'Lemon Juice', description: 'Freshly squeezed lemon juice with a hint of mint and the right amount of sweetness', category: 'Drinks', price: 30, veg: true, available: true, emoji: '🍋', gradient: 'linear-gradient(135deg, #FEF9C3 0%, #FDE047 100%)', stock: 40 },
    { id: 'item-8', name: 'Filter Coffee', description: 'Traditional South Indian filter coffee brewed strong and served hot', category: 'Drinks', price: 25, veg: true, available: true, emoji: '☕', gradient: 'linear-gradient(135deg, #D4A574 0%, #A0522D 100%)', stock: 50 }
  ];

  const SAMPLE_USERS = [
    { id: 'STU1024', name: 'Ananya Rao', email: 'ananya.rao@example.edu', phone: '9876543210', role: 'student', password: 'student123' },
    { id: 'ADM001', name: 'Admin User', email: 'admin@smartcanteen.edu', phone: '9876543211', role: 'admin', password: 'admin123' }
  ];

  const SAMPLE_ORDERS = [
    {
      id: 'SC-2026-001',
      studentId: 'STU1024',
      studentName: 'Ananya Rao',
      studentPhone: '9876543210',
      items: [
        { menuItemId: 'item-4', name: 'Paneer Roll', price: 80, quantity: 1 },
        { menuItemId: 'item-7', name: 'Lemon Juice', price: 30, quantity: 1 }
      ],
      subtotal: 110,
      total: 110,
      paymentMethod: 'counter',
      pickupTime: '12:45 PM',
      note: '',
      status: 'preparing',
      statusHistory: [
        { status: 'placed', time: '2026-10-28T12:30:00' },
        { status: 'accepted', time: '2026-10-28T12:32:00' },
        { status: 'preparing', time: '2026-10-28T12:35:00' }
      ],
      createdAt: '2026-10-28T12:30:00'
    }
  ];

  /* ───────── Internal state ───────── */
  let _menu = [];
  let _orders = [];
  let _users = [];
  let _cart = [];

  /* ───────── Helpers ───────── */
  function _save() {
    localStorage.setItem(KEYS.menu, JSON.stringify(_menu));
    localStorage.setItem(KEYS.orders, JSON.stringify(_orders));
    localStorage.setItem(KEYS.users, JSON.stringify(_users));
    localStorage.setItem(KEYS.cart, JSON.stringify(_cart));
  }

  function _load() {
    try { _menu = JSON.parse(localStorage.getItem(KEYS.menu)) || []; } catch { _menu = []; }
    try { _orders = JSON.parse(localStorage.getItem(KEYS.orders)) || []; } catch { _orders = []; }
    try { _users = JSON.parse(localStorage.getItem(KEYS.users)) || []; } catch { _users = []; }
    try { _cart = JSON.parse(localStorage.getItem(KEYS.cart)) || []; } catch { _cart = []; }
  }

  function _isoNow() {
    return new Date().toISOString();
  }

  function _isToday(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
  }

  /* ───────── Public API ───────── */
  window.DataStore = {

    /* ---------- Initialization ---------- */
    init: function () {
      if (localStorage.getItem(KEYS.init)) {
        _load();
        return;
      }
      _menu = JSON.parse(JSON.stringify(SAMPLE_MENU));
      _orders = JSON.parse(JSON.stringify(SAMPLE_ORDERS));
      _users = JSON.parse(JSON.stringify(SAMPLE_USERS));
      _cart = [];
      _save();
      localStorage.setItem(KEYS.init, '1');
      localStorage.setItem(KEYS.orderSeq, '1');   // next sequence number
    },

    /* ---------- Menu ---------- */
    getMenuItems: function (filters) {
      let items = _menu.slice();
      if (!filters) return items;
      if (filters.category) {
        items = items.filter(i => i.category === filters.category);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(i =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
        );
      }
      if (filters.vegOnly) {
        items = items.filter(i => i.veg);
      }
      return items;
    },

    getMenuItem: function (id) {
      return _menu.find(i => i.id === id) || null;
    },

    addMenuItem: function (itemData) {
      const maxNum = _menu.reduce((m, i) => {
        const n = parseInt(i.id.replace('item-', ''), 10);
        return isNaN(n) ? m : Math.max(m, n);
      }, 0);
      const newItem = Object.assign({ id: 'item-' + (maxNum + 1) }, itemData);
      _menu.push(newItem);
      _save();
      return newItem;
    },

    updateMenuItem: function (id, updates) {
      const idx = _menu.findIndex(i => i.id === id);
      if (idx === -1) return null;
      Object.assign(_menu[idx], updates);
      _save();
      return _menu[idx];
    },

    deleteMenuItem: function (id) {
      const idx = _menu.findIndex(i => i.id === id);
      if (idx === -1) return false;
      _menu.splice(idx, 1);
      _save();
      return true;
    },

    /* ---------- Cart ---------- */
    getCart: function () {
      return _cart.slice();
    },

    addToCart: function (menuItemId) {
      const item = this.getMenuItem(menuItemId);
      if (!item || !item.available) return;
      const existing = _cart.find(c => c.menuItemId === menuItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        _cart.push({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          emoji: item.emoji,
          quantity: 1
        });
      }
      _save();
    },

    updateCartQty: function (menuItemId, qty) {
      if (qty <= 0) {
        this.removeFromCart(menuItemId);
        return;
      }
      const existing = _cart.find(c => c.menuItemId === menuItemId);
      if (existing) {
        existing.quantity = qty;
        _save();
      }
    },

    removeFromCart: function (menuItemId) {
      _cart = _cart.filter(c => c.menuItemId !== menuItemId);
      _save();
    },

    clearCart: function () {
      _cart = [];
      _save();
    },

    getCartSummary: function () {
      const subtotal = _cart.reduce((s, c) => s + c.price * c.quantity, 0);
      const count = _cart.reduce((s, c) => s + c.quantity, 0);
      return {
        items: _cart.slice(),
        subtotal: subtotal,
        total: subtotal,
        count: count
      };
    },

    /* ---------- Orders ---------- */
    getOrders: function (filters) {
      let orders = _orders.slice();
      if (!filters) return orders;
      if (filters.studentId) {
        orders = orders.filter(o => o.studentId === filters.studentId);
      }
      if (filters.status) {
        orders = orders.filter(o => o.status === filters.status);
      }
      if (filters.today) {
        orders = orders.filter(o => _isToday(o.createdAt));
      }
      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return orders;
    },

    getOrder: function (id) {
      return _orders.find(o => o.id === id) || null;
    },

    createOrder: function (data) {
      const order = {
        id: this.generateOrderId(),
        studentId: data.studentId,
        studentName: data.studentName,
        studentPhone: data.studentPhone,
        items: data.items,
        subtotal: data.subtotal,
        total: data.total,
        paymentMethod: data.paymentMethod,
        pickupTime: data.pickupTime,
        note: data.note || '',
        status: 'placed',
        statusHistory: [{ status: 'placed', time: _isoNow() }],
        createdAt: _isoNow()
      };
      _orders.push(order);

      // Reduce stock for each item
      order.items.forEach(function (oi) {
        var mi = _menu.find(function (m) { return m.id === oi.menuItemId; });
        if (mi) {
          mi.stock = Math.max(0, mi.stock - oi.quantity);
        }
      });

      _save();
      return order;
    },

    updateOrderStatus: function (orderId, newStatus) {
      const order = _orders.find(o => o.id === orderId);
      if (!order) return null;
      order.status = newStatus;
      order.statusHistory.push({ status: newStatus, time: _isoNow() });
      _save();
      return order;
    },

    /* ---------- Auth ---------- */
    login: function (identifier, password) {
      const user = _users.find(u => {
        if (u.role === 'admin') {
          return (u.email === identifier || identifier === 'admin') && u.password === password;
        }
        return u.email === identifier && u.password === password;
      });
      if (!user) return null;
      const safeUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
      sessionStorage.setItem(KEYS.auth, JSON.stringify(safeUser));
      return safeUser;
    },

    getCurrentUser: function () {
      try {
        return JSON.parse(sessionStorage.getItem(KEYS.auth)) || null;
      } catch {
        return null;
      }
    },

    logout: function () {
      sessionStorage.removeItem(KEYS.auth);
    },

    /* ---------- Dashboard Stats ---------- */
    getDashboardStats: function () {
      const todayOrders = _orders.filter(o => _isToday(o.createdAt));

      const todaySales = todayOrders
        .filter(o => o.status !== 'rejected')
        .reduce((s, o) => s + o.total, 0);

      const newOrders = todayOrders.filter(o => o.status === 'placed').length;
      const preparing = todayOrders.filter(o => o.status === 'preparing' || o.status === 'accepted').length;
      const ready = todayOrders.filter(o => o.status === 'ready').length;
      const completed = todayOrders.filter(o => o.status === 'completed').length;

      // Popular items
      const itemCounts = {};
      todayOrders.forEach(o => {
        o.items.forEach(i => {
          itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
        });
      });
      const popularItems = Object.entries(itemCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Low stock
      const lowStock = _menu
        .filter(i => i.stock <= 5)
        .map(i => ({ name: i.name, stock: i.stock, id: i.id }));

      return {
        todayOrders: todayOrders.length,
        todaySales,
        newOrders,
        preparing,
        ready,
        completed,
        popularItems,
        lowStock
      };
    },

    /* ---------- Order ID Generator ---------- */
    generateOrderId: function () {
      let seq = parseInt(localStorage.getItem(KEYS.orderSeq) || '1', 10);
      const year = new Date().getFullYear();
      const id = 'SC-' + year + '-' + String(seq).padStart(3, '0');
      localStorage.setItem(KEYS.orderSeq, String(seq + 1));
      return id;
    },

    /* ---------- Reset (for debugging) ---------- */
    reset: function () {
      localStorage.removeItem(KEYS.menu);
      localStorage.removeItem(KEYS.orders);
      localStorage.removeItem(KEYS.users);
      localStorage.removeItem(KEYS.cart);
      localStorage.removeItem(KEYS.init);
      localStorage.removeItem(KEYS.orderSeq);
      sessionStorage.removeItem(KEYS.auth);
      this.init();
    }
  };
})();
