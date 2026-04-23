import type { NextConfig } from 'next'

const config: NextConfig = {
  serverExternalPackages: ['@xenova/transformers', 'pdf-parse'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals as string[]), 'sharp', 'canvas']
    }
    return config
  },
}

export default config
