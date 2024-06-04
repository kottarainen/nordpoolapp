import paho.mqtt.client as mqtt
from nordpool_scrape import run

MQTT_Topic = "nordpool/test"
mqttBroker = "broker.mqttdashboard.com"
        
def on_message(client, userdata, message):
    print("received message: " ,str(message.payload.decode("utf-8")))
    if len(message.payload.decode("utf-8")) > 0:
        print("Triggering nordpool_scrape.py")
        content= run()
        client.publish("nordpool/prices", str(content))

client = mqtt.Client("Nordpool_Sniffer")
client.connect(mqttBroker)
client.subscribe(MQTT_Topic)
client.on_message = on_message
client.loop_forever()
