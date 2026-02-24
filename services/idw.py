import math

# haversine function is used to calculate shortest distance between two points on sphere
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # radius of earch in km
    rad_lat1, rad_lat2 = math.radians(lat1), math.radians(lat2) # convert to radians
    rad_diff_lat = math.radians(lat2 - lat1) # convert distance to radians
    rad_diff_lon = math.radians(lon2 - lon1)

    a = math.sin(rad_diff_lat / 2)**2 + math.cos(rad_lat1) * math.cos(rad_lat2) * math.sin(rad_diff_lon / 2)**2

    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# idw implementation
def idw(lat, lon, stations, power=2):
    numerator = 0
    denominator = 0

    for s in stations:
        d = haversine(lat, lon, s["lat"], s["lon"]) # uses haversine function to calculate distance between the current route point and  the WAQI station
        if d == 0: # if there is no distance between point and station, then just assign that station reading to point
            return s["aqi"]

        w = 1 / (d ** power) # runs idw using each station found
        numerator += w * s["aqi"] # add weighted aqis
        denominator += w #total weight

    return numerator / denominator # final interpolated aqi value
