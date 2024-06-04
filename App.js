import React, { Component } from 'react';
import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    sync: {},
});

class App extends Component {
    constructor() {
        super();
        this.onMessageArrived = this.onMessageArrived.bind(this);
        this.onConnectionLost = this.onConnectionLost.bind(this);
        const client = new Paho.MQTT.Client('broker.mqttdashboard.com', 8000, 'clientId-jO8ppprP')
        client.onMessageArrived = this.onMessageArrived;
        client.onConnectionLost = this.onConnectionLost;
        client.connect({
            onSuccess: this.onConnect,
            useSSL: false,
            onFailure: (e) => { console.log("Connection error: ", e); this.setState({ error: `Connection error: ${e.errorMessage}` }); },
        });

        this.state = {
            sentMessages: [],
            receivedMessages: [],
            client,
            messageToSend: '',
            isConnected: false,
            error: '',
        };
    }

    onMessageArrived(entry) {
        console.log("Message arrived: " + entry.payloadString);
        this.setState({ receivedMessages: [...this.state.receivedMessages, entry.payloadString] });
    }

    onConnect = () => {
        const { client } = this.state;
        console.log("Connected to MQTT broker!");
        client.subscribe('nordpool/prices');
        console.log("Subscribed to nordpool/prices");
        this.setState({ isConnected: true, error: '' });
    };

    sendMessage() {
        const message = new Paho.MQTT.Message("fetch_data");
        message.destinationName = "nordpool/test";

        if (this.state.isConnected) {
            console.log("Sending message: fetch_data");
            this.setState({ sentMessages: [...this.state.sentMessages, "fetch_data"] });
            this.state.client.send(message);
        } else {
            console.log("Not connected");
        }
    }

    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("Connection lost: " + responseObject.errorMessage);
            this.setState({ error: `Lost Connection: ${responseObject.errorMessage}`, isConnected: false });
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>
                    Nordpool MQTT App
                </Text>
                <Text style={styles.status}>
                    {this.state.isConnected ? 'Connected' : 'Not Connected'}
                </Text>
                <Text style={styles.error}>
                    {this.state.error}
                </Text>
                <TextInput
                    value={this.state.messageToSend}
                    onChangeText={(value) => this.setState({ messageToSend: value })}
                    placeholder="Your message..."
                    style={styles.input}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.sendMessage.bind(this)}
                >
                    <Text style={styles.buttonText}>Send Message</Text>
                </TouchableOpacity>
                <ScrollView style={styles.messageContainer}>
                    <Text style={styles.label}>
                        Sent Messages:
                    </Text>
                    <Text style={styles.messages}>
                        {this.state.sentMessages.join(' --- ')}
                    </Text>
                    <Text style={styles.label}>
                        Received Messages:
                    </Text>
                    <Text style={styles.messages}>
                        {this.state.receivedMessages.join('\n')}
                    </Text>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        padding: 10,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        margin: 20,
        color: '#333333',
        fontWeight: 'bold',
    },
    status: {
        fontSize: 18,
        color: 'green',
        marginBottom: 10,
    },
    error: {
        fontSize: 14,
        color: 'red',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        width: '100%',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#87CEEB',
        padding: 10,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContainer: {
        flex: 1,
        width: '100%',
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },
    messages: {
        fontSize: 14,
        color: '#333333',
        backgroundColor: '#D3D3D3',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
});

export default App;

