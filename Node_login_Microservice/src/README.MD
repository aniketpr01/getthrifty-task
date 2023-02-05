npm install 
npx tsc --init
docker build -t node_login_microservice .
docker run -p 3000:3000 node_login_microservice

To scale:
docker compose up --scale app=2