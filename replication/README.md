# MongoDB Replica Set with Docker Compose

This directory contains the Docker Compose setup for a MongoDB replica set.

## docker-compose.yml
- Will set up three MongoDB instances as part of a replica set and a service to initialize the replica set.
- Each instance is configured to restart automatically.
- `mongo-init` service runs a script to initiate the replica set after a delay then exits.
```yaml title="docker-compose.yml"
services:
  # MongoDB replica set services
  mongo1:
    image: mongo:latest
    command: mongod --replSet rs0
    volumes:
      - mongo1-data:/data/db
    networks:
      - mongoCluster
    container_name: mongo1
    restart: always

  mongo2:
    image: mongo:latest
    command: mongod --replSet rs0
    volumes:
      - mongo2-data:/data/db
    networks:
      - mongoCluster
    container_name: mongo2
    restart: always

  mongo3:
    image: mongo:latest
    command: mongod --replSet rs0
    volumes:
      - mongo3-data:/data/db 
    networks:
      - mongoCluster
    container_name: mongo3
    restart: always

  # Temporary service to initialize the replica set
  # Exits after running the replicaSet.js script
  mongo-init:
    image: mongo:latest
    volumes:
      - ./replicaSet.js:/replicaSet.js:ro
    networks:
      - mongoCluster
    command: ["sh", "-c", "sleep 10 && mongosh --host mongo1:27017 /replicaSet.js"]
    depends_on:
      - mongo1
      - mongo2
      - mongo3
    container_name: mongo-init

volumes:
  mongo1-data:
    name: mongo1-data
    driver: local
  mongo2-data:
    name: mongo2-data
    driver: local
  mongo3-data:
    name: mongo3-data
    driver: local
networks:
  mongoCluster:
    name: mongoCluster
    driver: bridge
```

## Replica Set Initialization Script
- The `replicaSet.js` script is used to initialize the replica set.
- Used by the `mongo-init` service to set up the replica set configuration.

```javascript title="replicaSet.js"
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
})
```

## How to run?
1. Ensure Docker and Docker Compose are installed on your machine.
2. Navigate to the `replication` directory.
3. Run the following command to start the MongoDB replica set:
   ```bash
   docker-compose up -d
   ```
4. Wait for the services to start. The `mongo-init` service will automatically run the initialization script.
5. Check the status of the replica set by connecting to one of the MongoDB instances:
   ```bash
   docker exec -it mongo1 mongosh --eval "rs.status()"
   ```