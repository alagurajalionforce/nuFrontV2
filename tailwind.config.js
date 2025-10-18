/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                roboto: ['Roboto', 'sans-serif'],
            },
            colors: {
                customBlueDark: '#01054C',
                customBlueLight: '#020CB2',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            boxShadow: {
                'custom': '0px 4px 6px rgba(0, 0, 0, 0.5), 0px 1px 3px rgba(0, 0, 0, 0.08)',
            },

        },
    },
    plugins: [],
};
