# logics build stage
FROM rust:1.76-alpine AS logics-build-stage
WORKDIR /app
COPY . .
RUN cargo install wasm-bindgen-cli
RUN cargo build --release --target wasm32-unknown-unknown
RUN wasm-bindgen --target web --out-dir ./target/logics-wasm-bindgen/ --out-name "logics" ./target/wasm32-unknown-unknown/release/logics.wasm
RUN cp -r assets ../public/assets

# vue build stage
FROM node:lts-alpine AS vue-build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY --from=logics-build-stage /app /app
RUN npm run build

# production stage
FROM nginx:stable-alpine AS production-stage
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=vue-build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
