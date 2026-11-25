import type {NextConfig} from 'next';

const config: NextConfig = {
  // les photos d'une annonce partent avec le formulaire : jusqu'à 8 photos de téléphone
  experimental: {serverActions: {bodySizeLimit: '60mb'}},
};

export default config;
