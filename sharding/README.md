# MongoDB Sharding
This directory contains the setup and management scripts for a MongoDB sharded cluster using Docker. The `Makefile` provides commands to initialize, run, and manage the sharded cluster, including starting replica sets and adding shards.

## Getting Started
1. Ensure you have Docker and Docker Compose installed on your machine.
2. Navigate to the `sharding` directory.

## Create Docker Network
Run the following command to create a Docker network `mongoCluster` for the sharded cluster:
```bash
docker network create mongoCluster
```

## Start the config server replica set
Run the following command to start the config server replica set:
```bash
docker compose -f cfgsvr/docker-compose.yml up -d
```

## Initialize the config server replica set
- After starting the config server, open interactive shell on one of the config server containers:
```bash
docker exec -it cfgsvr1 mongosh
```

- Run the initialization script:
```javascript
rs.initiate({
  _id: "cfgrs",
  configsvr: true,
  members: [
    { _id: 0, host: "cfgsvr1:27017" },
    { _id: 1, host: "cfgsvr2:27017" },
    { _id: 2, host: "cfgsvr3:27017" }
  ]
})
```

- Check the status of the replica set, it takes a few seconds to elect a primary:
```javascript
rs.status()
```

## Start the shard replica sets
Run the following command to start the shard replica sets:
```bash
docker compose -f shard1/docker-compose.yml up -d
```

## Initialize the shard replica sets
- Open an interactive shell on one of the shard containers:
```bash
docker exec -it shard1 mongosh
```

- Run the initialization script for each shard:
```javascript
rs.initiate({
  _id: "shard1rs",
  members: [
    { _id: 0, host: "shard1svr1:27017" },
    { _id: 1, host: "shard1svr2:27017" },
    { _id: 2, host: "shard1svr3:27017" }
  ]
})
```

- Check the status of the replica set:
```javascript
rs.status()
```

> Note: Repeat the above steps for `shard2` and `shard3` by changing the hostnames accordingly.

## Start the mongos router
Run the following command to start the `mongos` router:
```bash
docker compose -f mongos/docker-compose.yml up -d
```

## Add shards to the cluster
- Connect to the `mongos` router:
```bash
docker exec -it mongos mongosh
```

- Add the shards to the cluster:
- Adding `shard1`:
```javascript
sh.addShard("shard1rs/shard1svr1:27017,shard1svr2:27017,shard1svr3:27017")
```

- Adding `shard2`:
```javascript
sh.addShard("shard2rs/shard2svr1:27017,shard2svr2:27017,shard2svr3:27017")
```

- Adding `shard3`:
```javascript
sh.addShard("shard3rs/shard3svr1:27017,shard3svr2:27017,shard3svr3:27017")
```

## Verify the sharded cluster
- List the shards:
```javascript
sh.listShards()
```

## Sharding a collection
- To shard a collection, first ensure the database is created:
```javascript
use imdb
```

- Enable sharding for the database:
```javascript
sh.enableSharding("imdb")
```

- Create a sharded collection with a shard key:
```javascript
sh.shardCollection("imdb.movies", { "title": "hashed" })
```

- Insert some sample data:
```javascript
db.movies.insertMany([
  { title: "Inception", year: 2010 },
  { title: "The Matrix", year: 1999 },
  { title: "Interstellar", year: 2014 }
])
```

- Check the shard distribution:
```javascript
db.movies.getShardDistribution()
```

## Cleanup
- To remove containers, networks, and volumes created by the Docker Compose files, run:
```bash
docker compose -f mongos/docker-compose.yml down
docker compose -f cfgsvr/docker-compose.yml down
docker compose -f shard1/docker-compose.yml down
docker compose -f shard2/docker-compose.yml down
docker compose -f shard3/docker-compose.yml down
docker network rm mongoCluster
```

## Using Makefile
You can also use the provided `Makefile` to manage the sharded cluster. The following commands are available:
- Start the MongoDB Sharded Cluster setup:
```bash
make run
```

- Stop and remove all containers, networks, and volumes `(dangerous: as it will remove all data in this project)`:
```bash
make clean
```

- Show the status of all replica sets in the cluster:
```bash
make clusters
```

- Add shards to the cluster:
```bash
make addShards
```

- List all shards in the cluster:
```bash
make shards
```

- Show the help message:
```bash
make help
```
