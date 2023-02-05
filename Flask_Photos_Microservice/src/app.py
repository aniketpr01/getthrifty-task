from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from pymongo import MongoClient
import redis
import json


app = Flask(__name__)

# Connect to MongoDB
app.config[
    "MONGO_URI"
] = "mongodb://root:password@test_mongodb:27017/photosdb?authSource=admin"
mongo = PyMongo(app)

# Connect to Redis
redis_conn = redis.Redis(host="rediscli", port=6379, db=0)


@app.route("/photos/<user_id>", methods=["GET"])
def get_photos(user_id):
    user_id = str(user_id)
    photos = []
    cache_key = f"photos:{user_id}"
    cached_photos = redis_conn.get(cache_key)
    print("redis cache data", cached_photos)
    if cached_photos:
        photos = eval(cached_photos)
    else:
        result = mongo.db.collection_name.find({"user_id": int(user_id)})
        if result:
            for photo in result:
                photos.append(photo["photo"])
            redis_conn.set(cache_key, json.dumps(photos))
        else:
            print("result not found")
            return jsonify({})

    return jsonify({"photos": photos})


@app.route("/photos", methods=["POST"])
def store_photos():
    user_id = request.json.get("user_id")
    photo = request.json.get("photo")
    result = mongo.db.collection_name.insert_one({"user_id": user_id, "photo": photo})
    if result:
        cache_key = f"photos:{user_id}"
        redis_conn.delete(cache_key)
        # return jsonify({"result": "Photo stored successfully."})
        return jsonify(
            {
                "message": "Photo stored successfully",
                "photo_id": str(result.inserted_id),
            }
        )

    else:
        return jsonify({"error": "Failed to store photo."})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
    # get_photos_dev(1)
