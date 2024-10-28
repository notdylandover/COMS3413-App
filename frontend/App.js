import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import ProfileScreen from './components/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [userData, setUserData] = useState({ firstName: '', lastName: '' });

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                setIsLoggedIn(!!token);
                if (token) {
                    const firstName = await AsyncStorage.getItem('firstName');
                    const lastName = await AsyncStorage.getItem('lastName');
                    setUserData({ firstName, lastName });
                }
            } catch (error) {
                console.error('Error fetching token:', error);
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);

    const handleUserUpdate = (firstName, lastName) => {
        setUserData({ firstName, lastName });
    };

    if (isLoggedIn === null) {
        return null; 
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {isLoggedIn ? (
                    <>
                        <Stack.Screen name="Welcome" options={{ headerShown: false }}>
                            {props => <WelcomeScreen {...props} userData={userData} setIsLoggedIn={setIsLoggedIn} />}
                        </Stack.Screen>
                        <Stack.Screen name="Profile">
                            {props => <ProfileScreen {...props} userData={userData} onUserUpdate={handleUserUpdate} />}
                        </Stack.Screen>
                    </>
                ) : (
                    <Stack.Screen name="Login" options={{ headerShown: false }}>
                        {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                    </Stack.Screen>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
