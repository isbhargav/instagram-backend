# instagram-backend

REST services with functionalites similar to Instagram

# Built using

- Nodejs
- Express
- Typescript 
- mongodb
- mongoose
- JWT

# Database Design 

![database](db_diagram.png)

# Endpoints

![endponts](/api_ends.png)

Link to insomia backup file : [backup](Insomnia_2020-12-21.yaml)


# How to run the project

1. Clone the repo to you computer
2. run the following docker command to get mongodb running
```shell
# run Mongo with persistent data
docker run  --rm -v $HOME/docker/volumes/mongodb:/data/db -p 27017:27017 --name mongodb-docker -d mongo
```
3. npm install
4. npm run dev or npm run watch
