from database import places_collection

places = [
    {
        "name": "Lotus Temple",
        "category": "Religious",
        "rating": 4.7,
        "reviews": 2100,
        "lat": 28.5535,
        "lng": 77.2588,
        "address": "South Delhi",
        "trending": True
    },
    {
        "name": "India Gate",
        "category": "Historical",
        "rating": 4.8,
        "reviews": 5000,
        "lat": 28.6129,
        "lng": 77.2295,
        "address": "Central Delhi",
        "trending": True
    },
    {
        "name": "Connaught Place",
        "category": "Shopping",
        "rating": 4.5,
        "reviews": 4100,
        "lat": 28.6315,
        "lng": 77.2167,
        "address": "Delhi",
        "trending": False
    }
]

places_collection.insert_many(places)