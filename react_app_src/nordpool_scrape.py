from selenium import webdriver
from bs4 import BeautifulSoup
import time
import random

from paho.mqtt import client as mqtt_client

broker = 'broker.mqttdashboard.com'
port = 1883
topic = "nordpool/prices"
client_id = f'mqtt-{random.randint(0, 1000)}'

def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, error code %d\n", rc)

    client = mqtt_client.Client(client_id)
    client.on_connect = on_connect
    client.connect(broker, port)
    return client

def publish(client, text):
    msg = f"{text}"
    result = client.publish(topic, msg)
    status = result[0]
    if status == 0:
        print(f"Sent `{msg}` to `{topic}`")
    else:
        print(f"Failed to send message to {topic}")

def run():
    client = connect_mqtt()
    client.loop_start()
    driver = webdriver.Chrome() 
    driver.get('https://data.nordpoolgroup.com/auction/day-ahead/prices?deliveryDate=latest&currency=EUR&aggregation=Hourly&deliveryAreas=AT')
    time.sleep(5)

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    rows = soup.find_all('tr', class_='dx-row dx-data-row dx-column-lines')

    data = []
    i = 0
    for row in rows:
        if i < 12:
            row_data = [cell.get_text(strip=True) for cell in row.find_all('td')]
            data.append(row_data)
        else:
            break
        i+=1

    text_for_nordpool = "Nordpool prices:"    
    publish(client, text_for_nordpool)
    publish(client, str(data))
    client.loop_stop()
    driver.quit()

if __name__ == '__main__':
    run()
