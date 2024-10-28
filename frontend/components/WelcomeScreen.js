import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, Button, StyleSheet, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen({ navigation, setIsLoggedIn }) {
    const [firstName, setFirstName] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch('http://10.102.9.213:3000/user', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const result = await response.json();

                    if (response.ok) {
                        setFirstName(result?.firstname || '');
                        setProfileImage(result?.profileImage || '');
                    } else {
                        console.error(result?.message || 'Failed to fetch user information');
                    }
                } catch (error) {
                    console.error('Error fetching user information:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        setIsLoggedIn(false);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const handleProfileNavigation = () => {
        navigation.navigate('Profile');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.headerText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <Text style={styles.headerText}>Welcome, {firstName}!</Text>
            <View style={styles.buttonContainer}>
                <Button title="View Profile" onPress={handleProfileNavigation} />
                <Button title="Logout" onPress={handleLogout} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 16,
    },
    headerText: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: "center",
    },
});