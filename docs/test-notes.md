# Testing Round 1 — Catalog Service

## Test 1: Search distributed systems
curl http://localhost:3001/search/distributed%20systems
## Result: returned books 1 and 2 

## Test 2: Search undergraduate school
curl http://localhost:3001/search/undergraduate%20school
## Result: returned books 3 and 4 

## Test 3: Get info on book 2
curl http://localhost:3001/info/2
## Result: returned full details (title, topic, price, stock) 

## Test 4: Get info on book that doesnt exist
curl http://localhost:3001/info/99
## Result: returned empty response 

## All catalog endpoints working correctly




# Testing Round 2 — Full Flow

## Test 1: Search through frontend
curl http://localhost:3000/search/distributed%20systems
## Result: returned books 1 and 2 with id and title only 

## Test 2: Info through frontend
curl http://localhost:3000/info/2
## Result: returned full book details 

## Test 3: Purchase through frontend
curl -X POST http://localhost:3000/purchase/2
## Result: Successfully purchased "RPCs for Noobs" 

## Test 4: Verify stock decreased
curl http://localhost:3000/info/2
## Result: stock went from 3 to 2 


# Testing Round 3 — Persistence

## Test 1: Buy a book
curl -X POST http://localhost:3000/purchase/2
## Result: Successfully purchased 

## Test 2: Check stock
curl http://localhost:3000/info/2
## Result: stock = 2 

## Test 3: Restart catalog server, check stock again
curl http://localhost:3000/info/2
## Result: stock still = 2, not reset to 3 
## Persistence is working correctly



# Testing Round 4 — Restocking

## Set restock timer to 10 seconds for testing
## Buy book 4 until out of stock
curl -X POST http://localhost:3000/purchase/4
curl -X POST http://localhost:3000/purchase/4
curl -X POST http://localhost:3000/purchase/4
## Result: third attempt returned "Out of stock"

## Wait 10 seconds for restock timer
curl http://localhost:3000/info/4
## Result: stock increased by 2 automatically

## Changed timer back to 60 seconds for production

# Testing Round 5 — Docker

## Test 1: Search through Docker
curl http://localhost:3000/search/distributed%20systems
## Result: returned books 1 and 2 

## Test 2: Purchase through Docker
curl -X POST http://localhost:3000/purchase/2
## Result: Successfully purchased "RPCs for Noobs" 

## Test 3: Verify stock decreased
curl http://localhost:3000/info/2
## Result: stock decreased by 1 

## All 3 containers communicating correctly 


# Testing Round 6 — Load Balancing and Cache

## Test 1: Load balancing - send same request twice
curl http://localhost:3000/info/1
curl http://localhost:3000/info/1
## Result: first request went to replica 1, second served from cache 

## Test 2: Search cache
curl http://localhost:3000/search/distributed%20systems
curl http://localhost:3000/search/distributed%20systems
## Result: first request hit catalog, second served from cache 

## Frontend terminal showed Cache MISS then Cache HIT 


# Testing Round 7 — Cache Invalidation and Replica Sync

## Test 1: Get info (cached), then buy, then get info again
curl http://localhost:3000/info/2              # Cache MISS, saved to cache
curl -X POST http://localhost:3000/purchase/2  # Cache invalidated
curl http://localhost:3000/info/2              # Cache MISS, fresh data fetched 

## Test 2: Check both replicas have same stock
curl http://localhost:3001/info/2
curl http://localhost:3003/info/2
## Result: both show same stock number 