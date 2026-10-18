/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F4F7F4',
          elevated: '#FFFFFF',
        },
        // Brand palette from user specification
        brand: {
          bluePastel: '#E0F7FA', // Biru Muda Pastel
          tealSoft: '#B2DFDB',   // Hijau Toska Lembut
          tealLight: '#E0F2F1',  // Hijau Toska Sangat Muda
          emerald: '#2E7D32',    // Hijau Zamrud
          emeraldLight: '#E8F5E9',
          orange: '#FF9800',     // Oranye Tropis
          orangeDark: '#F57C00',
          orangeLight: '#FFF3E0',
          yellow: '#FFD600',     // Kuning Ceria
          goldYellow: '#FBC02D', // Kuning Emas
          goldLight: '#FFF9C4',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E7EFE6',
          200: '#CADAC8',
          300: '#A3B18A',
          400: '#588157',
          500: '#3A5A40',
          600: '#344E41',
        },
        cream: {
          50: '#FFFEFA',
          100: '#FEFAE0',
          200: '#FAF3C0',
          300: '#F5EBA0',
        },
        peach: {
          50: '#FFF7F2',
          100: '#FDE2D0',
          200: '#FBC5A4',
          300: '#F4A261',
        },
        skyPastel: {
          50: '#F4FAFF',
          100: '#E0F4FF',
          200: '#BEE1E6',
          300: '#90E0EF',
          400: '#0077B6',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(46, 125, 50, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)',
        'soft': '0 6px 24px -4px rgba(46, 125, 50, 0.08)',
        'hover': '0 12px 30px -4px rgba(46, 125, 50, 0.12)',
        'gold': '0 4px 14px 0 rgba(251, 192, 45, 0.35)',
        'orange': '0 4px 14px 0 rgba(255, 152, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
