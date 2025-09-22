import { createSlice } from '@reduxjs/toolkit';

// Define the initial state for the cart slice
const initialState = {
  items: [], // Array to store cart items
  orderHistory: [], // Array to store completed orders
};

// Create the cart slice using createSlice
const cartSlice = createSlice({
  name: 'cart', // Name of the slice
  initialState, // Initial state
  reducers: {
    // Add an item to the cart
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, increment quantity
        existingItem.quantity += 1;
      } else {
        // If item doesn't exist, add it with quantity 1
        state.items.push({ ...product, quantity: 1 });
      }
    },
    // Remove an item from the cart
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    // Update the quantity of an item in the cart
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        if (quantity < 1) {
          // Remove item if quantity is less than 1
          state.items = state.items.filter(i => i.id !== id);
        } else {
          // Update quantity
          item.quantity = quantity;
        }
      }
    },
    // Clear all items from the cart
    clearCart: (state) => {
      state.items = [];
    },
    // Add a completed order to the order history
    addOrderToHistory: (state, action) => {
      state.orderHistory.push(action.payload);
    },
  },
});

// Export the actions to be used in components
export const { addToCart, removeFromCart, updateQuantity, clearCart, addOrderToHistory } = cartSlice.actions;

// Export the reducer to be used in the store
export default cartSlice.reducer;