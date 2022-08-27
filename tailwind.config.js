const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Russo One', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      colors: {
        'white-100': '#F0F0F0',
        'white-200': '#EAEAEA',
        'white-300': '#E5E5E5',

        // 'white-smoke': '#F5F5F5',
        // 'white-smoke-2': '#F0F0F0',
        // 'off-white': '#FAF9F6',
        // 'bone-white': '#F9F6EE',
        // 'ghost-white': '#F8F8FF',
        // 'snow-white': '#FFFAFA',
        'translucent-light-gray': '#D0D0D0',
        'translucent-dark-gray': '#252525',
        // 'palette-dark-gray': '#272727',
        // 'palette-light-gray': '#747474',
        // 'palette-orange': '#FF652F',
        // 'palette-yellow': '#FFE400',
        // 'palette-green': '#14A76C',
        // 'palette-brown': '#844D36',
        // 'palette-mid-gray': '#474853',
        // 'palette-blue': '#86B3D1',
        // 'palette-light-gray': '#AAA0A0',
        // 'palette-beige': '#8E8268',
        // 'palette-1': '#F7F8FC',
        // 'palette-2': '#DCDFEE',
        // 'palette-3': '#878A99',
        // 'palette-4': '#545365',
        // 'palette-5': '#202136'
      },
    }
  },
  variants: {
    extend: {
      fontSize: ['hover']
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
