/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		config.resolve.alias.canvas = false

		config.experiments = { asyncWebAssembly: true, syncWebAssembly: true, layers: true, topLevelAwait: true }

		config.module.rules.push({
			test: /\.wasm$/,
			type: 'webassembly/async',
		})

		if (isServer) {
			config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm'
		} else {
			config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
		}

		return config
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb',
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'firebasestorage.googleapis.com',
				port: '',
			},
			{
				protocol: 'https',
				hostname: '*.pinata.cloud',
				port: '',
			},
			{
				protocol: 'https',
				hostname: '*.mypinata.cloud',
				port: '',
			},
			{
				protocol: 'https',
				hostname: 'edamam-product-images.s3.amazonaws.com',
				port: '',
			},
			{
				protocol: 'https',
				hostname: 'abs-0.twimg.com',
				port: '',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				port: '',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'blog.iagon.com',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'pbs.twimg.com',
			},
			{
				protocol: 'https',
				hostname: 'img.clerk.com',
			},
			{
				protocol: 'https',
				hostname: 'ipfs.io',
			},
		],
	},
	serverExternalPackages: ['lucid-cardano'],
}

export default nextConfig
