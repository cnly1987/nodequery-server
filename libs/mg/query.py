

import pymongo
from django.conf import settings

def mgdb():
    try:
        client = pymongo.MongoClient(settings.MONGO_BROKER_URL)
        return client
    except Exception as e:
        client.close()
        raise e
    finally:
        client.close()


        