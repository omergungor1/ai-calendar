export default function manifest() {
  return {
    name: "Takvim",
    short_name: "Takvim",
    description: "Haftalık takvim, ekip ve yapılacaklar",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#f4efe6",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
