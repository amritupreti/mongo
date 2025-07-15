// Add shard 1 replSet
sh.addShard("shard1rs/shard1svr1:27017,shard1svr2:27017,shard1svr3:27017");

// Add shard 2 replSet
sh.addShard("shard2rs/shard2svr1:27017,shard2svr2:27017,shard2svr3:27017");

// Add shard 3 replSet
sh.addShard("shard3rs/shard3svr1:27017,shard3svr2:27017,shard3svr3:27017");

// Verify the shards have been added
sh.listShards()