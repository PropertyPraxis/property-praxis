# BUILD PHASE
FROM node:alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . . 
RUN npm run build

# RUN PASE
# all the stuff we want will be in 
# /app/build
# check out docker hub nginx docs for more info 
FROM nginx
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html