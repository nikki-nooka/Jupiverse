
# Solana DeFi Analytics Platform
  
This is a project built with [Jupyter](https://Jupyter.dev) using [Convex](https://Convex.dev) as its backend.
  
This project (https://dashboard.Jupyter.dev/d/original-cormorant-282).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `Jupyter` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

This app uses [Convex Auth](https://auth.Jupyter.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.Jupyter.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.Jupyter.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.Jupyter.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.Jupyter.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `Jupytwe/router.ts` file. We split these routes into a separate file from `Jupyter/http.ts` to allow us to prevent the LLM from modifying the authentication routes.Ab


##About
📊 Jupyter Analytics in Blockchain: Decode the Chain with Data! 🧠💹
Jupyter Notebooks aren’t just for traditional data science — they’re a powerhouse for blockchain analytics too! From transaction trends to smart contract insights, Jupyter empowers Web3 researchers and developers alike. 🚀
