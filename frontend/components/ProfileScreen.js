import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, TextInput, Button, Image, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await fetch('http://10.102.9.213:3000/user', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const result = await response.json();

                if (response.ok) {
                    setFirstName(result.firstname || '');
                    setLastName(result.lastname || '');
                    setProfileImage(result.profileImage || null);

                    await AsyncStorage.setItem('firstName', result.firstname || '');
                    await AsyncStorage.setItem('lastName', result.lastname || '');
                    await AsyncStorage.setItem('profileImage', result.profileImage || '');
                } else {
                    alert('Failed to load profile data');
                }
            } catch (error) {
                console.error('Error loading profile data:', error);
                alert('An error occurred while loading profile data.');
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, []);

    const handleSaveChanges = async () => {
        const token = await AsyncStorage.getItem('token');
        setLoading(true);

        try {
            const response = await fetch('http://10.102.9.213:3000/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    profileImage
                })
            });

            const result = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('firstName', firstName || '');
                await AsyncStorage.setItem('lastName', lastName || '');
                await AsyncStorage.setItem('profileImage', profileImage || '');
                
                alert('Profile updated successfully!');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Welcome' }],
                });
            } else {
                alert(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>No Image Available</Text>
                        </View>
                    )}
                    
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                    
                    <Button title="Save Changes" onPress={handleSaveChanges} />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    headerText: {
        fontSize: 24,
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#d3d3d3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    placeholderText: {
        color: '#808080',
    },
    input: {
        height: 40,
        width: '80%',
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 8,
        marginBottom: 12,
    },
});
