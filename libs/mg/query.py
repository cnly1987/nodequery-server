

import pymongo
from django.conf import settings

def mgdb():
    try:
        client = pymongo.MongoClient(settings.MONGO_BROKER_URL)
        # client.admin.authenticate('cnly1987', 'wupeng1987', mechanism = 'SCRAM-SHA-1', source='nqmonitor')
        return client
    except Exception as e:
        client.close()
        raise e
    finally:
        client.close()


        