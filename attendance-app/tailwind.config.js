

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Make sure to add 'class' to enable dark mode based on a parent class
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   // Make sure to add 'class' to enable dark mode based on a parent class
//   darkMode: 'class',
  
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
  
//   theme: {
//     extend: {
//       colors: {
//         // Based on your MUI theme
//         'closr-green': '#65D6A4',
//         'closr-dark': '#2E373E',
//         'closr-light-dark': '#3C4750',
//         'closr-gray': '#8A949E',
//       },
//     },
//   },
  
//   plugins: [],
// }