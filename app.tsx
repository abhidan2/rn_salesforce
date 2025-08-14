import { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { oauth, net } from 'react-native-force';
import React from 'react';
import WebView from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';

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

const Tab = createNativeBottomTabNavigator();

function ContactListScreen() {
    const tabBarHeight = useBottomTabBarHeight();
    const [data, setData] = useState<Record[]>([]);
    const [udid, setUdid] = useState<string>('');
    const [currentUrl, setCurrentUrl] = useState<string>('');
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
    <View style={[styles.container, { paddingTop: tabBarHeight + 10 }]}>
        {/* <Text style={{ fontSize: 12, fontWeight: 'bold', marginVertical: 20, marginLeft: 10 }}>
            {`UDID: ${udid}`}
        </Text> */}
        <Text style={{ fontSize: 12, color: 'blue' , fontWeight: 'bold', marginVertical: 20, marginLeft: 10 }}>
            {`${currentUrl}`}
        </Text>
        <WebView
            source={{ uri: 'https://attone--servicedev.sandbox.my.salesforce.com/' }}
            webviewDebuggingEnabled
            // userAgent="Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3714.0 Mobile Safari/537.36"
            userAgent="Custom User Agent"
            style={{ flex: 1 }}
            onNavigationStateChange={(navState) => {
                console.log('Navigation State Change:', navState.url);
                setCurrentUrl(navState.url);
            }}
            onMessage={(event) => {
                console.log('Message from WebView:', event.nativeEvent.data);
            }}
            injectedJavaScript={`
                (function() {
                    window.ReactNativeWebView.postMessage("Hello from WebView!");
                })();
            `}

        />
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingTop: 22,
        backgroundColor: 'white',
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    }
});

const Stack = createStackNavigator();

function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}


function App(): JSX.Element {
    return (
        <NavigationContainer>
        <Tab.Navigator
            sidebarAdaptable={false}
            translucent
            scrollEdgeAppearance='transparent'
        >
            <Tab.Screen
            name="Home"
            component={ContactListScreen}
            options={{
                tabBarIcon: () => ({ sfSymbol: 'book' }),
            }}
            />
            <Tab.Screen
                name="Lead Central"
                component={ContactListScreen}
                options={{
                    tabBarIcon: () => ({ sfSymbol: 'gear' }),
            
                }}
            />
            <Tab.Screen
                name="Leads"
                component={HomeScreen}
                options={{
                    tabBarIcon: () => ({ sfSymbol: 'gear' }),
            
                }}
            />
            <Tab.Screen
                name="Cases"
                component={HomeScreen}
                options={{
                    tabBarIcon: () => ({ sfSymbol: 'gear' }),
            
                }}
            />
            <Tab.Screen
                name="Menu"
                component={HomeScreen}
                options={{
                    tabBarIcon: () => ({ sfSymbol: 'gear' }),
            
                }}
            />
        </Tab.Navigator>
          {/* <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}>
            <Stack.Screen name="Mobile SDK Sample App" component={ContactListScreen}  />
          </Stack.Navigator> */}
        </NavigationContainer>
    );
}

export default App;
