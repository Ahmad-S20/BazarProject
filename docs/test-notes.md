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
## Result: third attempt returned "Out of stock" ✅

## Wait 10 seconds for restock timer
curl http://localhost:3000/info/4
## Result: stock increased by 2 automatically ✅

## Changed timer back to 60 seconds for production