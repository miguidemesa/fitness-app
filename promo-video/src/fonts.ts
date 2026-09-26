import { loadFont as loadDisplay } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadBody } from "@remotion/google-fonts/Archivo";

// Condensed italic display stands in for the app's condensed italic Archivo headlines.
export const display = loadDisplay("italic", {
  weights: ["800"],
  subsets: ["latin"],
}).fontFamily;
export const body = loadBody("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
}).fontFamily;
