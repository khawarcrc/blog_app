This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


my-blog-app/
├── .env
├── .gitignore
├── @/
│   └── components/
│       └── ui/
│           └── sonner.jsx
├── app/
│   ├── about/
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   ├── me/
│   │   │   │   └── route.ts
│   │   │   └── register/
│   │   │       └── route.ts
│   │   ├── categories/
│   │   │   └── route.ts
│   │   ├── dashboard/
│   │   │   └── route.ts
│   │   ├── posts/
│   │   │   ├── [slug]/
│   │   │   │   ├── like/
│   │   │   │   │   └── route.ts    
│   │   │   │   └── dislike/
│   │   │   │       └── route.ts    
│   │   └── test-db/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── posts/
│   │       └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── page.tsx
│   └── register/
│       └── page.tsx
├── components.json
├── eslint.config.mjs
├── hooks/
│   └── use-mobile.ts
├── lib/
│   ├── auth.ts
│   ├── dbConnect.ts
│   └── utils.ts
├── middleware/
│   └── auth.ts
├── models/
│   ├── Category.ts
│   ├── Post.ts
│   └── User.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── postcss.config.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── types/
│   ├── api.ts
│   ├── category.ts
│   ├── index.ts
│   ├── jwt.ts
│   ├── post.ts
│   └── user.ts