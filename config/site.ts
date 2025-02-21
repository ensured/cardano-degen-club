export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'Home',
  description: 'All things Cardano and Food related.',
  mainNav: [
    {
      title: 'Cardano',
      href: '/',
    },
  ],
  links: {
    twitter: 'https://twitter.com/fam_cardano',
    github: 'https://github.com/ensured/cardanotools.xyz',
    docs: 'https://ui.shadcn.com',
  },
}
