import { VStack, Button, FormControl, FormLabel, Input, Text, Box } from "@chakra-ui/react"
import { useState } from "react"
import { useAuth } from "../context/useAuth"
import { useNavigate } from "react-router-dom"

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('');

    const nav = useNavigate()
    const { login_user } = useAuth();
    const handleNav = () => {
        nav('/register')
    }
    const handleLogin = async () => {
        // login_user(username,password)
        const success = await login_user(username, password);

        if (success) {
            nav('/'); // Navigate only if login succeeds
        } else {
            setErrorMessage('Incorrect username or password');
        }

    }
    return (
        <Box
            minH="100vh"
            bgImage="url('/Background.webp')"  // Replace with your image path
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="cover"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            position="relative"
        >
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="grey"
                opacity={0.5}  // adjust opacity for fade strength
                zIndex={0}
            />
            <VStack position="relative" zIndex={1} bg="white"          // <-- White background here
                p={8}               // <-- Padding inside the container
                borderRadius="md"   // <-- Rounded corners for better look
                boxShadow="md"      // <-- Subtle shadow
                spacing={4}         // <-- Space between form elements
                width="100%"
                maxW="400px">
                <FormControl>
                    <FormLabel>USERNAME</FormLabel>
                    <Input onChange={(e) => setUsername(e.target.value)} value={username} type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>PASSWORD</FormLabel>
                    <Input onChange={(e) => setPassword(e.target.value)} value={password} type='password' />
                </FormControl>
                <Button onClick={handleLogin} > Login</Button>
                {errorMessage && (
                    <Text color="red.500" fontSize="sm" mt={2}>
                        {errorMessage}
                    </Text>
                )}
                <Text onClick={handleNav} color="blue.500" cursor="pointer">
                    Don’t have an account?
                </Text>
            </VStack>


        </Box>

    )


}

export default Login