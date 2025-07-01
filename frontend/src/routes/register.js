import { VStack, Button, FormControl, FormLabel, Input, Box } from "@chakra-ui/react"
import { useState } from "react"
import { useAuth } from "../context/useAuth"


const Register = () => {
    const [firstName, setfirstName] = useState('')
    const [lastName, setlastName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [confirm_password, setconfrimPassword] = useState('')
    const [password, setPassword] = useState('')

    const { register_user } = useAuth();

    const handleRegister = () => {
        register_user(firstName, lastName, username, email, password, confirm_password)

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
                opacity={0.8}  // adjust opacity for fade strength
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
                    <FormLabel>First Name</FormLabel>
                    <Input onChange={(e) => setfirstName(e.target.value)} value={firstName} type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <Input onChange={(e) => setlastName(e.target.value)} value={lastName} type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>USERNAME</FormLabel>
                    <Input onChange={(e) => setUsername(e.target.value)} value={username} type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input onChange={(e) => setEmail(e.target.value)} value={email} type='text' />
                </FormControl>
                <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input onChange={(e) => setPassword(e.target.value)} value={password} type='password' />
                </FormControl>

                <FormControl>
                    <FormLabel>Confirm PASSWORD</FormLabel>
                    <Input onChange={(e) => setconfrimPassword(e.target.value)} value={confirm_password} type='password' />
                </FormControl>
                <Button onClick={handleRegister} > Register</Button>


            </VStack>
        </Box>
    )


}

export default Register;