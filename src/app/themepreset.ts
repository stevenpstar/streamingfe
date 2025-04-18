import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const ThemePreset = definePreset(Aura, {
  components: {
    button: {

    }
  },
  semantic: {
        primary: {
            50: '{noir.50}',
            100: '{noir.100}',
            200: '{noir.200}',
            300: '{noir.300}',
            400: '{noir.400}',
            500: '{noir.500}',
            600: '{noir.600}',
            700: '{noir.700}',
            800: '{noir.800}',
            900: '{noir.900}',
            950: '{noir.950}'
        }
    }
});
