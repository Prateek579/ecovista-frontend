// ========================
// FOOD OPTIONS
// ========================
export const FOOD_OPTIONS = {
  breakfast: {
    veg: ['Paratha / Roti', 'Poha', 'Upma', 'Bread & Butter', 'Milk', 'Curd / Yogurt', 'Fruits', 'Tea / Coffee', 'Paneer Dish', 'Veg Sandwich'],
    non_veg: ['Eggs', 'Egg Sandwich', 'Chicken Sandwich', 'Non-veg Roll', 'Bread & Butter', 'Milk / Tea / Coffee', 'Meat (Leftover)'],
  },
  lunch: {
    veg: ['Rice', 'Roti / Chapati', 'Dal', 'Mixed Vegetables', 'Paneer Curry', 'Salad', 'Curd', 'Rajma / Chole', 'Khichdi'],
    non_veg: ['Chicken Curry', 'Mutton Curry', 'Fish Curry', 'Egg Curry', 'Rice', 'Roti / Chapati', 'Salad', 'Dal'],
  },
  dinner: {
    veg: ['Roti / Chapati', 'Rice', 'Dal', 'Vegetables', 'Paneer Dish', 'Salad', 'Curd', 'Khichdi'],
    non_veg: ['Chicken Dish', 'Fish Dish', 'Mutton Dish', 'Egg Curry', 'Rice', 'Roti / Chapati', 'Salad'],
  },
};

// ========================
// WASTE CATEGORIES
// ========================
export const WASTE_CATEGORIES = [
  { key: 'food', label: 'Food Waste', icon: '🍕', color: '#f59e0b' },
  { key: 'plastic', label: 'Plastic Waste', icon: '🧴', color: '#3b82f6' },
  { key: 'paper', label: 'Paper Waste', icon: '📄', color: '#8b5cf6' },
  { key: 'metal', label: 'Metal Waste', icon: '🔩', color: '#6b7280' },
  { key: 'glass', label: 'Glass Waste', icon: '🥛', color: '#06b6d4' },
  { key: 'e_waste', label: 'E-Waste', icon: '📱', color: '#ef4444' },
  { key: 'other', label: 'Other', icon: '📦', color: '#78716c' },
];

export const WASTE_ITEMS = {
  food: ['Cooked leftovers', 'Raw vegetables/fruits', 'Expired food'],
  plastic: ['Bottles', 'Carry bags', 'Food packaging', 'Containers', 'Wrappers'],
  paper: ['Newspaper', 'Cardboard', 'Tissue', 'Office'],
  metal: ['Aluminium cans', 'Scrap', 'Food tins', 'Cans', 'Foil'],
  glass: ['Bottles', 'Broken glass', 'Jars'],
  e_waste: ['Mobile accessories', 'Batteries', 'Electronics', 'Devices', 'Cables'],
  other: ['Other'],
};

export const WASTE_QUANTITIES = {
  food: ['<0.25kg', '0.25-0.5kg', '0.5-1kg', '>1kg'],
  plastic: ['<0.1kg', '0.1-0.25kg', '0.25-0.5kg', '>0.5kg'],
  paper: ['<0.25kg', '0.25-0.5kg', '0.5-1kg', '>1kg'],
  metal: ['<0.1kg', '0.1-0.25kg', '0.25-0.5kg', '>0.5kg'],
  glass: ['<0.25kg', '0.25-0.5kg', '0.5-1kg', '>1kg'],
  e_waste: ['1', '2-3', 'More'],
  other: ['<0.25kg', '0.25-0.5kg', '0.5-1kg', '>1kg'],
};

// ========================
// ELECTRICITY APPLIANCES
// ========================
export const ELECTRICITY_APPLIANCES = [
  { key: 'ac', label: 'AC', icon: '❄️' },
  { key: 'refrigerator', label: 'Refrigerator', icon: '🧊' },
  { key: 'washing_machine', label: 'Washing Machine', icon: '🫧' },
  { key: 'microwave', label: 'Microwave', icon: '🍳' },
  { key: 'desktop', label: 'Desktop', icon: '🖥️' },
  { key: 'tv', label: 'TV', icon: '📺' },
  { key: 'lights', label: 'Lights', icon: '💡' },
  { key: 'fans', label: 'Fans', icon: '🌀' },
  { key: 'laptop', label: 'Laptop', icon: '💻' },
  { key: 'mobile_charging', label: 'Mobile Charging', icon: '🔋' },
  { key: 'iron', label: 'Iron', icon: '👔' },
  { key: 'geyser', label: 'Geyser', icon: '🚿' },
  { key: 'kettle', label: 'Kettle', icon: '☕' },
  { key: 'mixer', label: 'Mixer', icon: '🥤' },
];

// ========================
// TRAVEL MODES
// ========================
export const TRAVEL_MODES = [
  { key: 'bike', label: 'Bike', icon: '🏍️' },
  { key: 'car', label: 'Car', icon: '🚗' },
  { key: 'public_transport', label: 'Public Transport', icon: '🚌' },
];
