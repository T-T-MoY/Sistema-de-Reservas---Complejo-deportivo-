/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta base del Complejo Deportivo
        palette: {
          wine: '#261211',
          petroleum: '#1C3034',
          ivory: '#F1EADA',
          dark: '#101010',
        },

        // ========================================
        // MODO CLARO — base IVORY (#F1EADA) + PETROLEUM (#1C3034)
        // ========================================
        claro: {
          primario: '#1C3034',   
          hover: '#142326',     
          tinte: '#E5DDCB',    
          acento: '#261211',     
          fondo: '#F1EADA',     
          tarjeta: '#FAF5EC',   
          borde: '#DCD3C1',     
          texto: '#101010',      
          texto2: '#4A4643',  
        },

        // ========================================
        // MODO OSCURO — base OBSIDIAN (#101010) + PETROLEUM (#1C3034) + IVORY (#F1EADA)
        // ========================================
        oscuro: {
          primario: '#5DA797',   
          hover: '#4C8F80',      
          tinte: '#1C3034',      
          acento: '#261211',    
          fondo: '#101010',      
          tarjeta: '#151d20',   
          borde: '#26383c',      
          texto: '#F1EADA',      
          texto2: '#A8A296',     
        }
      },

      // Animaciones que antes vivían en styles/canchas-landing.css
      // (landing + tarjetas de canchas), migradas aquí para no perderlas.
      keyframes: {
        pulseDot: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(93,167,151,0.6)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 8px rgba(93,167,151,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(93,167,151,0)' },
        },
        floatOrb1: {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(45px,35px) scale(1.12)' },
          '100%': { transform: 'translate(-35px,55px) scale(0.95)' },
        },
        floatOrb2: {
          '0%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-55px,-25px) scale(1.18)' },
          '100%': { transform: 'translate(35px,-45px) scale(0.92)' },
        },
        modalFadeIn: {
          from: { opacity: 0, transform: 'scale(0.96)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
        'float-orb-1': 'floatOrb1 16s ease-in-out infinite alternate',
        'float-orb-2': 'floatOrb2 20s ease-in-out infinite alternate',
        'modal-in': 'modalFadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
}
