FROM node:lts-alpine
RUN wget -qO - https://pnpm.js.org/pnpm.js | node - add --global pnpm
