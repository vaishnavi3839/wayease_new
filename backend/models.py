from pydantic import BaseModel

class Place(BaseModel):
    name: str
    category: str
    rating: float
    reviews: int
    lat: float
    lng: float
    address: str
    distance: float = 0
    trending: bool = False