import React, { useState } from "react";
import { Text, SafeAreaView, StyleSheet, TextInput, Button, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation, setIsLoggedIn }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");

    const handlePress = async () => {
        if (isLogin) {
            if (email === '' || password === '') {
                return setMessage('Please fill out all fields.');
            }
        } else {
            if (email === '' || password === '' || firstName === '' || lastName === '') {
                return setMessage('Please fill out all fields.');
            }
        }

        const url = isLogin ? 'http://10.102.9.213:3000/login' : 'http://10.102.9.213:3000/register';
        const body = isLogin ? { username: email, password: password } : { firstname: firstName, lastname: lastName, username: email, password: password, profileImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png' };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (response.ok) {
                if (isLogin) {
                    if (result?.token) {
                        await AsyncStorage.setItem('token', result.token);
                        setIsLoggedIn(true);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    }
                    setMessage('Login successful');
                } else {
                    setMessage('Registration successful. Please log in.');
                    setIsLogin(true);
                }
            } else {
                setMessage(result?.message || 'Something went wrong.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.headerText}>{isLogin ? "Login" : "Sign Up"}</Text>

                {!isLogin && (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter first name"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter last name"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />

                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <Button
                            title={isLogin ? "Login" : "Sign Up"}
                            onPress={handlePress}
                        />
                    </View>
                    <View style={styles.button}>
                        <Button
                            title={isLogin ? "Switch to Sign Up" : "Switch to Login"}
                            onPress={() => setIsLogin(!isLogin)}
                        />
                    </View>
                </View>

                {message ? <Text style={styles.message}>{message}</Text> : null}
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
    input: {
        height: 40,
        width: "80%",
        borderColor: "gray",
        borderWidth: 1,
        margin: "auto",
        marginBottom: 12,
        paddingLeft: 8,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    button: {
        width: "75%",
        marginBottom: 15,
    },
    message: {
        marginTop: 20,
        color: "green",
        textAlign: "center",
    },
});