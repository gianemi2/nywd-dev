/** @type {import('tailwindcss').Config} */
export default {
    mode: 'jit',
    content: [
        './main/**/*.{html,js,jsx,ts,tsx,vue}',
        'node_modules/preline/dist/*.js',
    ], // Assicurati di includere i tuoi file qui
    important: true,
    theme: {
        extend: {
            borderRadius: {
                nywd: "30px"
            },
            container: {
                center: true,
                padding: '1rem'
            },
            colors: {
                notActive: 'hsl(60, 1.20%, 83%)',
                primary: 'hsl(210, 10%, 20%)',   // #2A2E33
                accent: 'hsl(30, 17%, 95%)',     // #F5F3F1
                muted: 'hsl(210, 8%, 96%)',      // #F1F4F5
                white: 'hsl(0, 0%, 100%)',       // #FFFFFF
                dark: 'hsl(210, 15%, 22%)',       // #363D44,
            },
            fontFamily: {
                sans: ['Work Sans', 'sans-serif'],
                serif: ['EB Garamond', 'serif'],
            },
            spacing: {
                // Aggiungi spaziature personalizzate qui
                '0': '0px',
                '1': '0.25rem',  // 4px
                '2': '0.5rem',   // 8px
                '3': '0.75rem',  // 12px
                '4': '1rem',     // 16px
                '5': '1.25rem',  // 20px
                '6': '1.5rem',   // 24px
                '8': '2rem',     // 32px
                '10': '2.5rem',  // 40px
                '12': '3rem',    // 48px
                '16': '4rem',    // 64px
                '20': '5rem',    // 80px
                '24': '6rem',    // 96px
                '32': '8rem',    // 128px
                // Aggiungi ulteriori spaziature secondo necessità
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('preline/plugin'),
    ],
};
