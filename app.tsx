/*
 * Copyright (c) 2020-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { oauth, net } from 'react-native-force';
import React from 'react';
import WebView from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';

interface Response {
    records: Record[]
}

interface Record {
    Id: String,
    Name: String
}

interface Props {
}

interface State {
    data : Record[]
}

function ContactListScreen() {
    const [data, setData] = useState<Record[]>([]);
    const [udid, setUdid] = useState<string>('');
    useEffect(() => {
        DeviceInfo.getUniqueId().then((uniqueId) => {
        // iOS: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
        // Android: "dd96dec43fb81c97"
        // Windows: "{2cf7cb3c-da7a-d508-0d7f-696bb51185b4}"
        console.log('Device Unique ID: ' + uniqueId);
        setUdid(uniqueId);
        });
        const fetchData = () => {
            net.query('SELECT Id, Name FROM Contact LIMIT 100',
                (response: Response) => setData(response.records),
                (error) => console.log('Failed to query:' + error)
            );
        };

        oauth.getAuthCredentials(
            fetchData, // already logged in
            () => {
                oauth.authenticate(
                    fetchData,
                    (error) => console.log('Failed to authenticate:' + error)
                );
            }
        );
    }, []);
  return (
    <View style={styles.container}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginVertical: 10, marginLeft: 10 }}>
            {`UDID: ${udid}`}
        </Text>
        <WebView
            source={{ uri: 'https://attone--servicedev.sandbox.my.salesforce.com/' }}
            webviewDebuggingEnabled
            // userAgent="Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3714.0 Mobile Safari/537.36"
            userAgent="Custom User Agent"
            style={{ flex: 1 }}  />
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22,
        backgroundColor: 'white',
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    }
});

const Stack = createStackNavigator();

function App(): JSX.Element {
    return (
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="Mobile SDK Sample App" component={ContactListScreen}  />
          </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
