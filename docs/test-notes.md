## Testing Round 1 — Catalog Service

# Test 1: Search distributed systems
curl http://localhost:3001/search/distributed%20systems
# Result: returned books 1 and 2 

# Test 2: Search undergraduate school
curl http://localhost:3001/search/undergraduate%20school
# Result: returned books 3 and 4 

# Test 3: Get info on book 2
curl http://localhost:3001/info/2
# Result: returned full details (title, topic, price, stock) 

# Test 4: Get info on book that doesnt exist
curl http://localhost:3001/info/99
# Result: returned empty response 

# All catalog endpoints working correctly