.PHONY: run clean clusters addShards shards help
.DEFAULT_GOAL := help

BEAUTIFY_RS = 'rs.status().members.forEach(member => console.log(member.name + " - " + member.stateStr))'
BEAUTIFY_SHARDS = 'sh.listShards().forEach(shard => console.log(shard._id + " - " + shard.host))'

run:
	@echo "Create networks for MongoDB Sharded Cluster..."
	@docker network create --driver bridge mongoCluster

	@echo "\nStarting MongoDB Sharded Cluster setup..."
	@echo "Starting config server replica set..."
	@docker compose -f cfgsvr/docker-compose.yml up -d

	@echo "\nStarting shard 1 replica set..."
	@docker compose -f shard1/docker-compose.yml up -d

	@echo "\nStarting shard 2 replica set..."
	@docker compose -f shard2/docker-compose.yml up -d

	@echo "\nStarting shard 3 replica set..."
	@docker compose -f shard3/docker-compose.yml up -d

	@echo "\nWaiting for all shards to be ready..."
	@sleep 10  # Adjust sleep time as necessary for your environment

	@echo "Initializing config server replica set..."
	@docker cp cfgsvr/replicaSet.js cfgsvr1:/replicaSet.js
	@docker exec -it cfgsvr1 mongosh --quiet /replicaSet.js
	@echo "Config server replica set initialized."

	@echo "\nInitializing shard 1 replica set..."
	@docker cp shard1/replicaSet.js shard1svr1:/replicaSet.js
	@docker exec -it shard1svr1 mongosh --quiet /replicaSet.js
	@echo "Shard 1 replica set initialized."

	@echo "\nInitializing shard 2 replica set..."
	@docker cp shard2/replicaSet.js shard2svr1:/replicaSet.js
	@docker exec -it shard2svr1 mongosh --quiet /replicaSet.js
	@echo "Shard 2 replica set initialized."

	@echo "\nInitializing shard 3 replica set..."
	@docker cp shard3/replicaSet.js shard3svr1:/replicaSet.js
	@docker exec -it shard3svr1 mongosh --quiet /replicaSet.js
	@echo "Shard 3 replica set initialized."

	@echo "\nWaiting for all cluster components to stabilize..."
	@sleep 10  # Adjust sleep time as necessary for your environment

	@echo "\nStarting mongos router..."
	@docker compose -f mongos/docker-compose.yml up -d	
	@echo "Waiting for mongos to stabilize..."
	@sleep 10  # Wait for mongos to start														

	@echo "\nMongoDB Sharded Cluster setup complete."

clean:
	@echo "Stopping and removing all containers, networks, and volumes."
	
	@echo "Tearing down mongos router."
	@docker compose -f mongos/docker-compose.yml down

	@echo "\nTearing down config server replica set."
	@docker compose -f cfgsvr/docker-compose.yml down -v

	@echo "\nTearing down shard 1 replica set."
	@docker compose -f shard1/docker-compose.yml down -v

	@echo "\nTearing down shard 2 replica set."
	@docker compose -f shard2/docker-compose.yml down -v

	@echo "\nTearing down shard 3 replica set."
	@docker compose -f shard3/docker-compose.yml down -v

	@echo "\nRemoving MongoDB network."
	@docker network rm mongoCluster

clusters:
	@echo "Config Server Replica Set Status:"
	@docker exec -it cfgsvr1 mongosh --quiet --eval ${BEAUTIFY_RS}

	@echo "\nShard 1 Replica Set Status:"
	@docker exec -it shard1svr1 mongosh --quiet --eval ${BEAUTIFY_RS}

	@echo "\nShard 2 Replica Set Status:"
	@docker exec -it shard2svr1 mongosh --quiet --eval ${BEAUTIFY_RS}

	@echo "\nShard 3 Replica Set Status:"
	@docker exec -it shard3svr1 mongosh --quiet --eval ${BEAUTIFY_RS}

addShards:
	@echo "Please run 'make clusters' to verify the status of all replica sets before adding shards."
	@echo "\nAdding shards to the cluster..."
	@docker exec -it mongos mongosh --quiet --eval 'sh.addShard("shard1rs/shard1svr1:27017,shard1svr2:27017,shard1svr3:27017")'
	@docker exec -it mongos mongosh --quiet --eval 'sh.addShard("shard2rs/shard2svr1:27017,shard2svr2:27017,shard2svr3:27017")'
	@docker exec -it mongos mongosh --quiet --eval 'sh.addShard("shard3rs/shard3svr1:27017,shard3svr2:27017,shard3svr3:27017")'
	@echo "\nAll shards added to the cluster successfully."

shards:
	@echo "Listing all shards in the cluster..."
	@docker exec -it mongos mongosh --quiet --eval ${BEAUTIFY_SHARDS}

help:
	@echo "Usage:"
	@echo "  make run          - Start the MongoDB Sharded Cluster setup."
	@echo "  make clean        - Stop and remove all containers, networks, and volumes."
	@echo "  make clusters     - Show the status of all replica sets in the cluster."
	@echo "  make addShards    - Add shards to the cluster. Refer to 'Makefile' for details."
	@echo "  make shards       - List all shards in the cluster."
	@echo "  make help         - Show this help message."
