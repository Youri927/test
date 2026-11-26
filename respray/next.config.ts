import type {NextConfig} from 'next';

const config: NextConfig = {
  // les photos d'une annonce partent avec le formulaire : jusqu'à 8 photos de téléphone
  experimental: {serverActions: {bodySizeLimit: '60mb'}},
  // les images fixes du site (accueil, exemple, polices) restent en cache dans le navigateur : en revenant sur
  // l'accueil, elles s'affichent tout de suite au lieu d'être redemandées au serveur
  async headers() {
    const cache = [{key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800'}];
    return ['/demo/:f*', '/fonts/:f*', '/email/:f*', '/bimi/:f*'].map((source) => ({source, headers: cache}));
  },
};

export default config;
