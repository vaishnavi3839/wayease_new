from fastapi import APIRouter, Query
from database import places_collection
from utils import calculate_distance

router = APIRouter()

# 📌 1. SEARCH + FILTER + DISTANCE + PAGINATION
@router.get("/places")
def get_places(
    search: str = "",
    category: str = "",
    lat: float = 28.6139,   # Delhi default
    lng: float = 77.2090,
    max_distance: float = 5,
    page: int = 1,
    limit: int = 5
):
    query = {}

    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    if category and category != "All":
        query["category"] = category

    places = list(places_collection.find(query, {"_id": 0}))

    # Calculate distance
    filtered = []
    for place in places:
        dist = calculate_distance(lat, lng, place["lat"], place["lng"])
        if dist <= max_distance:
            place["distance"] = round(dist, 2)
            filtered.append(place)

    # Pagination
    start = (page - 1) * limit
    end = start + limit

    return {
        "total": len(filtered),
        "page": page,
        "places": filtered[start:end]
    }


# 📌 2. TRENDING PLACES
@router.get("/trending")
def get_trending():
    places = list(places_collection.find({"trending": True}, {"_id": 0}))
    return places


# 📌 3. MAP DATA (just lat/lng)
@router.get("/map")
def get_map_data():
    places = list(places_collection.find({}, {"_id": 0, "name": 1, "lat": 1, "lng": 1}))
    return places