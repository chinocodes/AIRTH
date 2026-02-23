import math

# haversine function is used to calculate distance between two points
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # radius of earth km
    radLat1, radLat2 = math.radians(lat1), math.radians(lat2) # convert to radians
    diffLat = math.radians(lat2 - lat1) #convert differences to radians
    diffLon = math.radians(lon2 - lon1)
    # encodes distance between points using trigonometry
    a = math.sin(diffLat / 2)**2 + math.cos(radLat1) * math.cos(radLat2) * math.sin(diffLon / 2)**2

    # convert into usable distance in km
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# idw computation
def idw(lat, lon, stations, power=2):
    numerator = 0
    denominator = 0

    for s in stations:
        d = haversine(lat, lon, s["lat"], s["lon"]) # uses haversine function to calculate distance between the current route point and  the WAQI station
        if d == 0:
            return s["aqi"]

        w = 1 / (d ** power)
        numerator += w * s["aqi"]
        denominator += w

    return numerator / denominator
